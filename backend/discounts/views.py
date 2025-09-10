from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Avg, Count
from django.shortcuts import get_object_or_404

from .models import Discount, DiscountScore, DiscountComment, DiscountReport
from .serializers import (
    DiscountSerializer, DiscountCreateSerializer, DiscountScoreSerializer,
    DiscountCommentSerializer, DiscountReportSerializer, DiscountSummarySerializer
)


class IsBusinessOwnerOrReadOnly(permissions.BasePermission):
    """
    کسب‌وکار فقط می‌تواند تخفیفات خودش را مدیریت کند
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        try:
            return obj.business == request.user.businessprofile
        except:
            return False


class IsCustomerOrReadOnly(permissions.BasePermission):
    """
    فقط مشتریان می‌توانند امتیاز و نظر دهند
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        try:
            return hasattr(request.user, 'customerprofile')
        except:
            return False


class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.filter(is_deleted=False)
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return DiscountCreateSerializer
        elif self.action == 'list' and self.request.user.role == 'business':
            return DiscountSummarySerializer
        return DiscountSerializer

    def get_queryset(self):
        queryset = Discount.objects.filter(is_deleted=False)
        
        if self.request.user.role == 'business':
            # کسب‌وکار فقط تخفیفات خودش را می‌بیند
            try:
                business = self.request.user.businessprofile
                queryset = queryset.filter(business=business)
            except:
                queryset = queryset.none()
        else:
            # مشتریان تخفیفات فعال را می‌بینند
            now = timezone.now()
            queryset = queryset.filter(
                start_date__lte=now,
                end_date__gte=now
            )

        return queryset.order_by('-created_at')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsBusinessOwnerOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_destroy(self, instance):
        # نرم حذف
        instance.is_deleted = True
        instance.save()

    @action(detail=True, methods=['post'], permission_classes=[IsCustomerOrReadOnly])
    def rate(self, request, pk=None):
        """امتیازدهی به تخفیف"""
        discount = self.get_object()
        customer = request.user.customerprofile
        
        serializer = DiscountScoreSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # اگر قبلاً امتیاز داده، آپدیت کن
            score_obj, created = DiscountScore.objects.get_or_create(
                discount=discount,
                user=customer,
                defaults={'score': serializer.validated_data['score']}
            )
            if not created:
                score_obj.score = serializer.validated_data['score']
                score_obj.save()
            
            return Response({'message': 'امتیاز شما ثبت شد'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """دریافت نظرات یک تخفیف"""
        discount = self.get_object()
        comments = discount.comments.filter(is_deleted=False).order_by('-created_at')
        serializer = DiscountCommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsCustomerOrReadOnly])
    def comment(self, request, pk=None):
        """ثبت نظر برای تخفیف"""
        discount = self.get_object()
        customer = request.user.customerprofile
        
        # چک کن که قبلاً نظر نداده باشد
        existing_comment = discount.comments.filter(user=customer, is_deleted=False).first()
        if existing_comment:
            return Response(
                {'error': 'شما قبلاً برای این تخفیف نظر داده‌اید'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = DiscountCommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(discount=discount)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsCustomerOrReadOnly])
    def report(self, request, pk=None):
        """گزارش تخلف تخفیف"""
        discount = self.get_object()
        serializer = DiscountReportSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(discount=discount)
            return Response(
                {'message': 'گزارش شما ثبت شد و بررسی خواهد شد'}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """خلاصه‌ای از تخفیفات برای داشبورد کسب‌وکار"""
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکارها دسترسی دارند'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            business = request.user.businessprofile
            now = timezone.now()
            
            # آمار کلی
            total_discounts = business.discounts.filter(is_deleted=False).count()
            active_discounts = business.discounts.filter(
                is_deleted=False,
                start_date__lte=now,
                end_date__gte=now
            ).count()
            expired_discounts = business.discounts.filter(
                is_deleted=False,
                end_date__lt=now
            ).count()
            
            # آخرین تخفیفات
            recent_discounts = business.discounts.filter(is_deleted=False).order_by('-created_at')[:5]
            recent_serializer = DiscountSummarySerializer(recent_discounts, many=True)
            
            return Response({
                'total_discounts': total_discounts,
                'active_discounts': active_discounts,
                'expired_discounts': expired_discounts,
                'recent_discounts': recent_serializer.data
            })
        except:
            return Response(
                {'error': 'خطا در دریافت اطلاعات'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
