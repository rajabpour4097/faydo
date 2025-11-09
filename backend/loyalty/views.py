from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import CustomerLoyalty, Transaction, EliteGiftClaim
from .serializers import (
    CustomerLoyaltySerializer, TransactionSerializer,
    TransactionCreateSerializer, BusinessInfoSerializer,
    TransactionCommentSerializer
)
from accounts.models import BusinessProfile


class CustomerLoyaltyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet برای مشاهده وفاداری مشتریان
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CustomerLoyaltySerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'customer':
            return CustomerLoyalty.objects.filter(customer=user.customerprofile)
        elif user.role == 'business':
            return CustomerLoyalty.objects.filter(business=user.businessprofile)
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            return CustomerLoyalty.objects.all()
        
        return CustomerLoyalty.objects.none()


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet برای مدیریت تراکنش‌ها
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'customer':
            return Transaction.objects.filter(customer=user.customerprofile)
        elif user.role == 'business':
            return Transaction.objects.filter(business=user.businessprofile)
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            return Transaction.objects.all()
        
        return Transaction.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionCreateSerializer
        return TransactionSerializer
    
    def create(self, request, *args, **kwargs):
        """
        ایجاد تراکنش جدید توسط مشتری
        """
        if request.user.role != 'customer':
            return Response(
                {'error': 'فقط مشتریان می‌توانند تراکنش ایجاد کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()
        
        # بازگشت با serializer کامل
        output_serializer = TransactionSerializer(transaction)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """
        تایید تراکنش توسط کسب‌وکار
        """
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکارها می‌توانند تراکنش را تایید کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transaction = self.get_object()
        
        # بررسی اینکه تراکنش متعلق به این کسب‌وکار است
        if transaction.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به تایید این تراکنش نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            transaction.approve()
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """
        رد تراکنش توسط کسب‌وکار
        """
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکارها می‌توانند تراکنش را رد کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transaction = self.get_object()
        
        # بررسی اینکه تراکنش متعلق به این کسب‌وکار است
        if transaction.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به رد این تراکنش نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            transaction.reject()
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request):
        """
        افزودن کامنت و امتیاز به تراکنش توسط مشتری
        """
        if request.user.role != 'customer':
            return Response(
                {'error': 'فقط مشتریان می‌توانند کامنت بگذارند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TransactionCommentSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                comment = serializer.save()
                return Response({
                    'success': True,
                    'message': 'کامنت شما با موفقیت ثبت شد',
                    'comment_id': comment.id
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def pending_count(self, request):
        """
        شمارش تراکنش‌های در انتظار تایید برای کسب‌وکار
        یا تراکنش‌های آماده نظردهی برای مشتری
        """
        user = request.user
        
        if user.role == 'business':
            # برای کسب‌وکار: تعداد تراکنش‌های pending
            count = Transaction.objects.filter(
                business=user.businessprofile,
                status='pending'
            ).count()
            return Response({
                'count': count,
                'type': 'pending_approval'
            })
        elif user.role == 'customer':
            # برای مشتری: تعداد تراکنش‌هایی که می‌تواند کامنت بگذارد
            count = Transaction.objects.filter(
                customer=user.customerprofile,
                can_comment=True,
                has_commented=False,
                comment_deadline__gt=timezone.now()
            ).count()
            return Response({
                'count': count,
                'type': 'can_comment'
            })
        else:
            return Response({'count': 0, 'type': 'none'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_business_by_code(request):
    """
    دریافت اطلاعات کسب‌وکار با unique_code
    """
    if request.user.role != 'customer':
        return Response(
            {'error': 'فقط مشتریان می‌توانند از این API استفاده کنند'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    unique_code = request.query_params.get('code')
    if not unique_code:
        return Response(
            {'error': 'کد یکتا الزامی است'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        unique_code = int(unique_code)
    except ValueError:
        return Response(
            {'error': 'کد یکتا باید عدد باشد'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # دریافت کسب‌وکار
    business = get_object_or_404(BusinessProfile, unique_code=unique_code)
    
    # دریافت پکیج فعال
    package = business.packages.filter(is_active=True, status='approved').first()
    
    # دریافت یا ایجاد CustomerLoyalty
    customer = request.user.customerprofile
    loyalty, created = CustomerLoyalty.objects.get_or_create(
        customer=customer,
        business=business
    )
    
    # ساخت داده‌های پاسخ
    data = {
        'business_id': business.id,
        'business_name': business.name,
        'business_logo': business.logo.url if business.logo else None,
        'business_description': business.description or '',
        
        # اطلاعات پکیج
        'has_active_package': package is not None,
        'discount_all_percentage': None,
        'has_specific_discount': False,
        'specific_discount_title': None,
        'specific_discount_percentage': None,
        'has_elite_gift': False,
        'elite_gift_title': None,
        'elite_gift_description': None,
        
        # اطلاعات مشتری
        'customer_points': loyalty.points,
        'customer_vip_status': loyalty.vip_status,
        'elite_gift_target_reached': loyalty.elite_gift_target_reached,
        'elite_gift_used': loyalty.elite_gift_used,
        
        # دسترسی به ویژگی‌ها
        'can_use_elite_gift': loyalty.elite_gift_target_reached and not loyalty.elite_gift_used,
        'can_use_vip': loyalty.vip_status in ['vip', 'vip_plus'],
        'can_use_vip_plus': loyalty.vip_status == 'vip_plus',
    }
    
    # اگر پکیج فعال دارد
    if package:
        if hasattr(package, 'discount_all'):
            data['discount_all_percentage'] = package.discount_all.percentage
        
        if hasattr(package, 'specific_discount'):
            data['has_specific_discount'] = True
            data['specific_discount_title'] = package.specific_discount.title
            data['specific_discount_percentage'] = package.specific_discount.percentage
        
        if hasattr(package, 'elite_gift'):
            data['has_elite_gift'] = True
            elite_gift = package.elite_gift
            data['elite_gift_title'] = elite_gift.gift
            
            # ساخت توضیحات هدیه
            if elite_gift.amount:
                data['elite_gift_description'] = f"هدیه به ارزش {elite_gift.amount:,} تومان"
            elif elite_gift.count:
                data['elite_gift_description'] = f"تعداد {elite_gift.count} عدد"
            else:
                data['elite_gift_description'] = elite_gift.gift
    
    serializer = BusinessInfoSerializer(data, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def elite_gift_progress(request, package_id):
    """
    دریافت پیشرفت مشتری برای دریافت هدیه ویژه
    """
    from packages.models import Package
    from .serializers import EliteGiftProgressSerializer
    
    # بررسی نقش کاربر
    if request.user.role != 'customer':
        return Response(
            {'error': 'فقط مشتریان می‌توانند پیشرفت خود را مشاهده کنند'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # پیدا کردن پکیج
    try:
        package = Package.objects.get(id=package_id)
    except Package.DoesNotExist:
        return Response(
            {'error': 'پکیج مورد نظر یافت نشد'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # بررسی وجود elite gift
    if not hasattr(package, 'elite_gift'):
        return Response(
            {'error': 'این پکیج هدیه ویژه ندارد'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # محاسبه پیشرفت
    elite_gift = package.elite_gift
    customer = request.user.customerprofile
    progress = elite_gift.get_customer_progress(customer)
    
    # اضافه کردن اطلاعات هدیه
    progress['gift_name'] = elite_gift.gift
    progress['gift_description'] = elite_gift.gift
    progress['package_id'] = package.id
    progress['package_start_date'] = package.start_date
    progress['package_end_date'] = package.end_date
    
    serializer = EliteGiftProgressSerializer(progress)
    return Response(serializer.data)


class EliteGiftClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet برای مدیریت درخواست‌های هدیه ویژه
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'customer':
            return EliteGiftClaim.objects.filter(customer=user.customerprofile)
        elif user.role == 'business':
            return EliteGiftClaim.objects.filter(business=user.businessprofile)
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            return EliteGiftClaim.objects.all()
        
        return EliteGiftClaim.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            from .serializers import EliteGiftClaimCreateSerializer
            return EliteGiftClaimCreateSerializer
        from .serializers import EliteGiftClaimSerializer
        return EliteGiftClaimSerializer
    
    def create(self, request, *args, **kwargs):
        """
        ثبت درخواست جدید توسط مشتری
        """
        if request.user.role != 'customer':
            return Response(
                {'error': 'فقط مشتریان می‌توانند درخواست ثبت کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        تایید درخواست توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # بررسی دسترسی
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکار می‌تواند درخواست را تایید کند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if claim.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به تایید این درخواست نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            note = request.data.get('note')
            claim.approve(note)
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        رد درخواست توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # بررسی دسترسی
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکار می‌تواند درخواست را رد کند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if claim.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به رد این درخواست نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            note = request.data.get('note')
            claim.reject(note)
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_used(self, request, pk=None):
        """
        علامت‌گذاری به عنوان استفاده شده توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # بررسی دسترسی
        if request.user.role != 'business':
            return Response(
                {'error': 'فقط کسب‌وکار می‌تواند این عملیات را انجام دهد'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if claim.business != request.user.businessprofile:
            return Response(
                {'error': 'شما مجاز به انجام این عملیات نیستید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            claim.mark_as_used()
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class EliteGiftClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet برای مدیریت درخواست‌های دریافت هدیه ویژه
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        from .models import EliteGiftClaim
        user = self.request.user
        
        if user.role == 'customer':
            return EliteGiftClaim.objects.filter(customer=user.customerprofile)
        elif user.role == 'business':
            return EliteGiftClaim.objects.filter(business=user.businessprofile)
        elif user.role in ['admin', 'it_manager', 'project_manager']:
            return EliteGiftClaim.objects.all()
        
        return EliteGiftClaim.objects.none()
    
    def get_serializer_class(self):
        from .serializers import EliteGiftClaimSerializer, EliteGiftClaimCreateSerializer
        
        if self.action == 'create':
            return EliteGiftClaimCreateSerializer
        return EliteGiftClaimSerializer
    
    def create(self, request, *args, **kwargs):
        """
        ایجاد درخواست دریافت هدیه ویژه
        """
        from .serializers import EliteGiftClaimCreateSerializer, EliteGiftClaimSerializer
        
        serializer = EliteGiftClaimCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        claim = serializer.save()
        
        # برگرداندن با serializer کامل
        output_serializer = EliteGiftClaimSerializer(claim)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """
        تایید درخواست توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # فقط کسب‌وکار می‌تواند تایید کند
        if request.user.role != 'business':
            return Response(
                {'detail': 'فقط کسب‌وکار می‌تواند این عملیات را انجام دهد'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # بررسی اینکه این درخواست مربوط به همین کسب‌وکار است
        if claim.business != request.user.businessprofile:
            return Response(
                {'detail': 'این درخواست مربوط به کسب‌وکار شما نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            note = request.data.get('note', '')
            claim.approve(note=note)
            
            from .serializers import EliteGiftClaimSerializer
            serializer = EliteGiftClaimSerializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """
        رد درخواست توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # فقط کسب‌وکار می‌تواند رد کند
        if request.user.role != 'business':
            return Response(
                {'detail': 'فقط کسب‌وکار می‌تواند این عملیات را انجام دهد'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # بررسی اینکه این درخواست مربوط به همین کسب‌وکار است
        if claim.business != request.user.businessprofile:
            return Response(
                {'detail': 'این درخواست مربوط به کسب‌وکار شما نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            note = request.data.get('note', '')
            claim.reject(note=note)
            
            from .serializers import EliteGiftClaimSerializer
            serializer = EliteGiftClaimSerializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_used(self, request, pk=None):
        """
        علامت‌گذاری هدیه به عنوان استفاده شده توسط کسب‌وکار
        """
        claim = self.get_object()
        
        # فقط کسب‌وکار می‌تواند این عملیات را انجام دهد
        if request.user.role != 'business':
            return Response(
                {'detail': 'فقط کسب‌وکار می‌تواند این عملیات را انجام دهد'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # بررسی اینکه این درخواست مربوط به همین کسب‌وکار است
        if claim.business != request.user.businessprofile:
            return Response(
                {'detail': 'این درخواست مربوط به کسب‌وکار شما نیست'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            claim.mark_as_used()
            
            from .serializers import EliteGiftClaimSerializer
            serializer = EliteGiftClaimSerializer(claim)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def elite_gift_progress(request, package_id):
    """
    دریافت پیشرفت کاربر در دریافت هدیه ویژه یک پکیج
    """
    from packages.models import Package
    from .serializers import EliteGiftProgressSerializer
    
    if request.user.role != 'customer':
        return Response(
            {'detail': 'فقط مشتریان می‌توانند پیشرفت خود را مشاهده کنند'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    package = get_object_or_404(Package, id=package_id)
    
    if not hasattr(package, 'elite_gift'):
        return Response(
            {'detail': 'این پکیج هدیه ویژه ندارد'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    elite_gift = package.elite_gift
    customer = request.user.customerprofile
    
    # دریافت پیشرفت
    progress = elite_gift.get_customer_progress(customer)
    
    # اضافه کردن اطلاعات هدیه و پکیج
    progress['gift_name'] = elite_gift.gift
    progress['gift_description'] = elite_gift.gift
    progress['package_id'] = package.id
    progress['package_start_date'] = package.start_date
    progress['package_end_date'] = package.end_date
    
    serializer = EliteGiftProgressSerializer(progress)
    return Response(serializer.data)
