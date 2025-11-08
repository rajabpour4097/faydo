from rest_framework import serializers
from .models import CustomerLoyalty, Transaction
from accounts.serializers import CustomerProfileSerializer, BusinessProfileSerializer
from packages.serializers import PackageDetailSerializer


class CustomerLoyaltySerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    business_name = serializers.CharField(source='business.name', read_only=True)
    
    class Meta:
        model = CustomerLoyalty
        fields = [
            'id', 'customer', 'customer_name', 'business', 'business_name',
            'points', 'elite_gift_target_reached', 'elite_gift_used',
            'elite_gift_used_date', 'vip_status', 'created_at', 'modified_at'
        ]
        read_only_fields = [
            'created_at', 'modified_at', 'vip_status', 
            'elite_gift_target_reached', 'elite_gift_used'
        ]


class TransactionSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    business_name = serializers.CharField(source='business.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'customer', 'customer_name', 'business', 'business_name',
            'package', 'loyalty', 'original_amount', 'discount_all_amount',
            'has_special_discount', 'special_discount_title',
            'special_discount_original_amount', 'special_discount_amount',
            'final_amount', 'points_earned', 'status', 'note',
            'created_at', 'modified_at'
        ]
        read_only_fields = [
            'discount_all_amount', 'special_discount_amount',
            'final_amount', 'points_earned', 'created_at', 'modified_at'
        ]


class TransactionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer برای ایجاد تراکنش جدید
    """
    class Meta:
        model = Transaction
        fields = [
            'business', 'original_amount',
            'has_special_discount', 'special_discount_title',
            'special_discount_original_amount', 'note'
        ]

    def validate(self, data):
        """
        اعتبارسنجی داده‌ها
        """
        # بررسی تخفیف خاص
        if data.get('has_special_discount'):
            if not data.get('special_discount_title'):
                raise serializers.ValidationError({
                    'special_discount_title': 'عنوان تخفیف خاص الزامی است'
                })
            if not data.get('special_discount_original_amount'):
                raise serializers.ValidationError({
                    'special_discount_original_amount': 'مبلغ تخفیف خاص الزامی است'
                })
        
        return data

    def create(self, validated_data):
        """
        ایجاد تراکنش جدید
        """
        request = self.context.get('request')
        
        # بررسی وجود customer profile
        try:
            customer = request.user.customerprofile
        except AttributeError:
            raise serializers.ValidationError({
                'error': 'پروفایل مشتری یافت نشد'
            })
        
        # دریافت کسب‌وکار
        business_id = validated_data.get('business')
        if isinstance(business_id, int):
            from accounts.models import BusinessProfile
            try:
                business = BusinessProfile.objects.get(id=business_id)
            except BusinessProfile.DoesNotExist:
                raise serializers.ValidationError({
                    'error': 'کسب‌وکار یافت نشد'
                })
        else:
            business = business_id
        
        # دریافت پکیج فعال کسب‌وکار
        package = business.packages.filter(is_active=True, status='approved').first()
        if not package:
            raise serializers.ValidationError({
                'error': 'کسب‌وکار پکیج فعالی ندارد'
            })
        
        # بررسی وجود discount_all
        if not hasattr(package, 'discount_all'):
            raise serializers.ValidationError({
                'error': 'پکیج کسب‌وکار تنظیمات تخفیف ندارد'
            })
        
        # اگر تخفیف خاص درخواست شده، بررسی کنیم که در پکیج موجود باشد
        if validated_data.get('has_special_discount'):
            if not hasattr(package, 'specific_discount'):
                raise serializers.ValidationError({
                    'error': 'این کسب‌وکار تخفیف خاص ارائه نمی‌دهد'
                })
        
        # دریافت یا ایجاد CustomerLoyalty
        loyalty, created = CustomerLoyalty.objects.get_or_create(
            customer=customer,
            business=business
        )
        
        # حذف business از validated_data و جایگزینی با object
        validated_data['business'] = business
        
        # ایجاد تراکنش
        transaction = Transaction.objects.create(
            customer=customer,
            package=package,
            loyalty=loyalty,
            **validated_data
        )
        
        return transaction


class BusinessInfoSerializer(serializers.Serializer):
    """
    Serializer برای نمایش اطلاعات کسب‌وکار بعد از اسکن QR
    """
    business_id = serializers.IntegerField()
    business_name = serializers.CharField()
    business_logo = serializers.SerializerMethodField()
    business_description = serializers.CharField()
    
    # اطلاعات پکیج
    has_active_package = serializers.BooleanField()
    discount_all_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    
    has_specific_discount = serializers.BooleanField()
    specific_discount_title = serializers.CharField(allow_null=True)
    specific_discount_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    
    has_elite_gift = serializers.BooleanField()
    elite_gift_title = serializers.CharField(allow_null=True)
    elite_gift_description = serializers.CharField(allow_null=True)
    
    # اطلاعات مشتری
    customer_points = serializers.IntegerField()
    customer_vip_status = serializers.CharField()
    elite_gift_target_reached = serializers.BooleanField()
    elite_gift_used = serializers.BooleanField()
    
    # دسترسی به ویژگی‌ها
    can_use_elite_gift = serializers.BooleanField()
    can_use_vip = serializers.BooleanField()
    can_use_vip_plus = serializers.BooleanField()
    
    def get_business_logo(self, obj):
        request = self.context.get('request')
        logo_url = obj.get('business_logo')
        if logo_url and request:
            return request.build_absolute_uri(logo_url)
        return None
