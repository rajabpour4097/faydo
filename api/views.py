from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from .models import (
    UserProfile, Category, Business, Offer, UserOffer, 
    Review, ReviewReply, Notification
)
from .serializers import (
    UserSerializer, UserProfileSerializer, CategorySerializer, 
    BusinessSerializer, OfferSerializer, UserOfferSerializer,
    ReviewSerializer, ReviewReplySerializer, NotificationSerializer,
    DashboardSerializer
)
from rest_framework.views import APIView

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user_type = request.data.get('user_type', 'customer')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        if not username or not password:
            return Response({'error': 'username و password الزامی است'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'نام کاربری تکراری است'}, status=400)
        user = User.objects.create_user(username=username, password=password, first_name=first_name, last_name=last_name)
        UserProfile.objects.create(user=user, user_type=user_type, points=0)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'profile': {'user_type': user_type, 'points': 0},
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=201)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """اطلاعات کاربر فعلی"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """داده‌های داشبورد کاربر"""
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            # ایجاد پروفایل اگر وجود نداشته باشد
            profile = UserProfile.objects.create(
                user=request.user,
                points=265,  # امتیاز پیش‌فرض
                interests=['fitness', 'food'],
                achievements=['starter']
            )
        
        # پیشنهادات بر اساس علایق
        recommended_offers = Offer.objects.filter(
            is_active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        )[:6]
        
        # نوتیفیکیشن‌های خوانده‌نشده
        notifications = Notification.objects.filter(
            user=request.user,
            is_read=False
        )[:5]
        
        # محاسبه پیشرفت
        current_level = profile.level
        levels = [
            {'name': 'برنزی', 'threshold': 0},
            {'name': 'نقره‌ای', 'threshold': 200},
            {'name': 'طلایی', 'threshold': 500},
            {'name': 'VIP', 'threshold': 900}
        ]
        
        next_level = None
        for level in levels:
            if profile.points < level['threshold']:
                next_level = level
                break
        
        if next_level:
            span = next_level['threshold'] - current_level['threshold']
            done = profile.points - current_level['threshold']
            progress = {
                'percent': min(100, round((done / span) * 100)),
                'remaining': next_level['threshold'] - profile.points
            }
        else:
            progress = {'percent': 100, 'remaining': 0}
        
        data = {
            'user_profile': profile,
            'recommended_offers': recommended_offers,
            'notifications': notifications,
            'progress': progress
        }
        
        serializer = DashboardSerializer(data)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class BusinessViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Business.objects.filter(is_active=True)
    serializer_class = BusinessSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        return queryset


class OfferViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Offer.objects.filter(is_active=True)
    serializer_class = OfferSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        now = timezone.now()
        queryset = queryset.filter(
            start_date__lte=now,
            end_date__gte=now
        )
        
        # فیلتر بر اساس دسته‌بندی
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(business__category__slug=category)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def save(self, request, pk=None):
        """ذخیره تخفیف"""
        offer = self.get_object()
        user_offer, created = UserOffer.objects.get_or_create(
            user=request.user,
            offer=offer,
            defaults={'is_saved': True}
        )
        
        if not created:
            user_offer.is_saved = True
            user_offer.save()
        
        return Response({'status': 'saved'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def use(self, request, pk=None):
        """استفاده از تخفیف"""
        offer = self.get_object()
        
        # بررسی امتیاز کافی
        try:
            profile = UserProfile.objects.get(user=request.user)
            if profile.points < offer.min_points:
                return Response(
                    {'error': 'امتیاز کافی نیست'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'پروفایل یافت نشد'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_offer, created = UserOffer.objects.get_or_create(
            user=request.user,
            offer=offer,
            defaults={'is_used': True, 'used_at': timezone.now()}
        )
        
        if not created and not user_offer.is_used:
            user_offer.is_used = True
            user_offer.used_at = timezone.now()
            user_offer.save()
            
            # افزایش تعداد استفاده
            offer.usage_count += 1
            offer.save()
        
        return Response({'status': 'used'})


class UserOfferViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserOfferSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserOffer.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def saved(self, request):
        """تخفیف‌های ذخیره‌شده"""
        saved_offers = self.get_queryset().filter(is_saved=True)
        serializer = self.get_serializer(saved_offers, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        business_id = self.request.query_params.get('business')
        if business_id:
            return Review.objects.filter(business_id=business_id)
        return Review.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """لایک کردن نظر"""
        review = self.get_object()
        review.likes += 1
        review.save()
        return Response({'likes': review.likes})
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """پاسخ به نظر"""
        review = self.get_object()
        text = request.data.get('text')
        if not text:
            return Response(
                {'error': 'متن پاسخ الزامی است'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reply = ReviewReply.objects.create(
            review=review,
            user=request.user,
            text=text
        )
        
        serializer = ReviewReplySerializer(reply)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """علامت‌گذاری به عنوان خوانده‌شده"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
