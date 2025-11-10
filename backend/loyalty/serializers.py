from rest_framework import serializers
from .models import CustomerLoyalty, Transaction, EliteGiftClaim
from accounts.serializers import CustomerProfileSerializer, BusinessProfileSerializer
from packages.serializers import PackageDetailSerializer
from packages.models import Comment
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone


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
    can_add_comment = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'customer', 'customer_name', 'business', 'business_name',
            'package', 'loyalty', 'original_amount', 'discount_all_amount',
            'has_special_discount', 'special_discount_title',
            'special_discount_original_amount', 'special_discount_amount',
            'final_amount', 'points_earned', 'status', 'note',
            'can_comment', 'comment_deadline', 'has_commented', 'can_add_comment',
            'created_at', 'modified_at'
        ]
        read_only_fields = [
            'discount_all_amount', 'special_discount_amount',
            'final_amount', 'points_earned', 'created_at', 'modified_at',
            'can_comment', 'comment_deadline', 'has_commented'
        ]
    
    def get_can_add_comment(self, obj):
        return obj.can_add_comment()


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
    service_category = serializers.CharField()
    
    # اطلاعات پکیج
    package_id = serializers.IntegerField(allow_null=True)
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


class TransactionCommentSerializer(serializers.Serializer):
    """
    Serializer برای ایجاد کامنت برای تراکنش
    """
    transaction_id = serializers.IntegerField()
    text = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    score = serializers.IntegerField(min_value=1, max_value=5, required=False, allow_null=True)
    
    # نوع خدمت که کامنت برای آن است
    service_type = serializers.ChoiceField(
        choices=['discount_all', 'specific_discount', 'elite_gift', 'vip_experience'],
        required=True
    )
    
    def validate_transaction_id(self, value):
        """بررسی وجود تراکنش"""
        try:
            transaction = Transaction.objects.get(id=value)
        except Transaction.DoesNotExist:
            raise serializers.ValidationError('تراکنش یافت نشد')
        
        return value
    
    def validate(self, data):
        """اعتبارسنجی کلی"""
        request = self.context.get('request')
        transaction = Transaction.objects.get(id=data['transaction_id'])
        
        # بررسی اینکه تراکنش متعلق به این مشتری است
        if transaction.customer != request.user.customerprofile:
            raise serializers.ValidationError('شما مجاز به کامنت‌گذاری برای این تراکنش نیستید')
        
        # بررسی امکان کامنت‌گذاری
        if not transaction.can_add_comment():
            if transaction.has_commented:
                raise serializers.ValidationError('شما قبلاً برای این تراکنش کامنت گذاشته‌اید')
            elif transaction.status != 'approved':
                raise serializers.ValidationError('فقط می‌توانید برای تراکنش‌های تایید شده کامنت بگذارید')
            elif transaction.comment_deadline and timezone.now() > transaction.comment_deadline:
                raise serializers.ValidationError('مهلت کامنت‌گذاری (12 ساعت) به پایان رسیده است')
            else:
                raise serializers.ValidationError('امکان کامنت‌گذاری برای این تراکنش وجود ندارد')
        
        # حداقل یکی از text یا score باید وجود داشته باشد
        if not data.get('text') and not data.get('score'):
            raise serializers.ValidationError('حداقل باید متن کامنت یا امتیاز را وارد کنید')
        
        return data
    
    def create(self, validated_data):
        """ایجاد کامنت"""
        transaction = Transaction.objects.get(id=validated_data['transaction_id'])
        service_type = validated_data['service_type']
        
        # تعیین content_object بر اساس نوع خدمت
        content_object = None
        if service_type == 'discount_all' and hasattr(transaction.package, 'discount_all'):
            content_object = transaction.package.discount_all
        elif service_type == 'specific_discount' and hasattr(transaction.package, 'specific_discount'):
            content_object = transaction.package.specific_discount
        elif service_type == 'elite_gift':
            # برای elite_gift از فیلد مستقیم transaction استفاده می‌کنیم
            if transaction.elite_gift:
                content_object = transaction.elite_gift
            elif hasattr(transaction.package, 'elite_gift'):
                content_object = transaction.package.elite_gift
        elif service_type == 'vip_experience':
            # برای VIP باید یکی از experienceها را انتخاب کنیم
            # فعلاً اولین experience را انتخاب می‌کنیم
            vip_exp = transaction.package.experiences.first()
            if vip_exp:
                content_object = vip_exp
        
        if not content_object:
            raise serializers.ValidationError(f'خدمت {service_type} در این پکیج یافت نشد')
        
        # ایجاد کامنت
        comment = Comment.objects.create(
            content_object=content_object,
            user=self.context['request'].user.customerprofile,
            text=validated_data.get('text', ''),
            score=validated_data.get('score')
        )
        
        # علامت‌گذاری تراکنش به عنوان کامنت شده
        transaction.has_commented = True
        transaction.save(update_fields=['has_commented'])
        
        return comment


class EliteGiftProgressSerializer(serializers.Serializer):
    """
    Serializer برای نمایش پیشرفت کاربر در دریافت هدیه ویژه
    """
    type = serializers.CharField(read_only=True)
    target = serializers.FloatField(read_only=True)
    current = serializers.FloatField(read_only=True)
    remaining = serializers.FloatField(read_only=True)
    percentage = serializers.FloatField(read_only=True)
    eligible = serializers.BooleanField(read_only=True)
    transactions_count = serializers.IntegerField(read_only=True)
    error = serializers.CharField(read_only=True, required=False)
    
    # اطلاعات هدیه
    gift_name = serializers.CharField(read_only=True)
    gift_description = serializers.CharField(read_only=True)
    package_id = serializers.IntegerField(read_only=True)
    package_start_date = serializers.DateField(read_only=True)
    package_end_date = serializers.DateField(read_only=True)


class EliteGiftClaimSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    business_name = serializers.CharField(source='business.name', read_only=True)
    gift_name = serializers.CharField(source='elite_gift.gift', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = EliteGiftClaim
        fields = [
            'id', 'customer', 'customer_name', 'elite_gift', 'gift_name',
            'package', 'business', 'business_name', 'progress_at_claim',
            'status', 'status_display', 'approved_at', 'used_at',
            'business_note', 'created_at', 'modified_at'
        ]
        read_only_fields = [
            'customer', 'progress_at_claim', 'approved_at', 'used_at',
            'created_at', 'modified_at'
        ]


class EliteGiftClaimCreateSerializer(serializers.Serializer):
    """
    Serializer برای ایجاد درخواست دریافت هدیه ویژه
    """
    package_id = serializers.IntegerField(required=True)
    
    def validate_package_id(self, value):
        from packages.models import Package
        
        try:
            package = Package.objects.get(id=value)
        except Package.DoesNotExist:
            raise serializers.ValidationError("پکیج مورد نظر یافت نشد")
        
        # بررسی اینکه پکیج فعال است
        if not package.is_active or package.status != 'approved':
            raise serializers.ValidationError("این پکیج فعال نیست")
        
        # بررسی اینکه پکیج دارای هدیه ویژه است
        if not hasattr(package, 'elite_gift'):
            raise serializers.ValidationError("این پکیج هدیه ویژه ندارد")
        
        return value
    
    def validate(self, attrs):
        from packages.models import Package
        from loyalty.models import EliteGiftClaim
        
        package = Package.objects.get(id=attrs['package_id'])
        customer = self.context['request'].user.customerprofile
        
        # بررسی اینکه درخواست pending نداشته باشد
        # کاربر می‌تواند چند بار Elite Gift بگیرد، ولی نباید درخواست pending داشته باشد
        existing_pending_claim = EliteGiftClaim.objects.filter(
            customer=customer,
            package=package,
            status='pending'
        ).first()
        
        if existing_pending_claim:
            raise serializers.ValidationError(
                {
                    'detail': 'شما یک درخواست در انتظار تایید دارید.',
                    'message': 'لطفا صبر کنید تا کسب‌وکار درخواست قبلی شما را بررسی کند.',
                    'claim_id': existing_pending_claim.id,
                    'created_at': existing_pending_claim.created_at
                }
            )
        
        # بررسی واجد شرایط بودن
        elite_gift = package.elite_gift
        if not elite_gift.is_customer_eligible(customer):
            progress = elite_gift.get_customer_progress(customer)
            raise serializers.ValidationError(
                f"شما هنوز واجد شرایط دریافت این هدیه نیستید. پیشرفت شما: {progress['percentage']}%"
            )
        
        attrs['package'] = package
        attrs['elite_gift'] = elite_gift
        attrs['customer'] = customer
        
        return attrs
    
    def create(self, validated_data):
        from loyalty.models import EliteGiftClaim
        
        package = validated_data['package']
        elite_gift = validated_data['elite_gift']
        customer = validated_data['customer']
        
        # دریافت پیشرفت فعلی
        progress = elite_gift.get_customer_progress(customer)
        
        # ایجاد درخواست
        claim = EliteGiftClaim.objects.create(
            customer=customer,
            elite_gift=elite_gift,
            package=package,
            business=package.business,
            progress_at_claim=progress,
            status='pending'
        )
        
        return claim
