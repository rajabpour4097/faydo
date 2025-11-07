from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import CustomerLoyalty, Transaction
from .serializers import (
    CustomerLoyaltySerializer, TransactionSerializer,
    TransactionCreateSerializer, BusinessInfoSerializer
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
