from rest_framework import serializers
from .models import (
    Package, DiscountAll, SpecificDiscount, EliteGift, 
    VipExperienceCategory, VipExperience, Comment, CommentLike
)
from accounts.models import BusinessProfile


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.user.last_name', read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'text', 'user_name', 'user_last_name', 'created_at', 'likes_count', 'is_liked']
        read_only_fields = ['id', 'created_at']
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                customer_profile = request.user.customerprofile
                return obj.likes.filter(user=customer_profile).exists()
            except:
                return False
        return False


class DiscountAllSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = DiscountAll
        fields = ['id', 'percentage', 'score', 'comments', 'created_at', 'modified_at']
        read_only_fields = ['id', 'created_at', 'modified_at']


class SpecificDiscountSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = SpecificDiscount
        fields = ['id', 'percentage', 'title', 'description', 'score', 'comments', 'created_at', 'modified_at']
        read_only_fields = ['id', 'created_at', 'modified_at']


class EliteGiftSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = EliteGift
        fields = ['id', 'amount', 'count', 'gift', 'score', 'comments', 'created_at', 'modified_at']
        read_only_fields = ['id', 'created_at', 'modified_at']


class VipExperienceCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = VipExperienceCategory
        fields = ['id', 'vip_type', 'category_name', 'name', 'description', 'created_at', 'modified_at']
        read_only_fields = ['id', 'created_at', 'modified_at']


class VipExperienceSerializer(serializers.ModelSerializer):
    vip_experience_category = VipExperienceCategorySerializer(read_only=True)
    vip_experience_category_id = serializers.IntegerField(write_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = VipExperience
        fields = ['id', 'vip_experience_category', 'vip_experience_category_id', 'score', 'comments', 'created_at', 'modified_at']
        read_only_fields = ['id', 'created_at', 'modified_at']


class PackageListSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)
    business_id = serializers.IntegerField(source='business.id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # اطلاعات کسب‌وکار
    business_logo = serializers.SerializerMethodField()
    business_image = serializers.SerializerMethodField()
    business_category = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    
    # اطلاعات تخفیف کلی
    discount_percentage = serializers.SerializerMethodField()
    
    # اطلاعات تخفیف اختصاصی
    specific_discount_title = serializers.SerializerMethodField()
    specific_discount_percentage = serializers.SerializerMethodField()
    specific_discount_description = serializers.SerializerMethodField()
    
    # اطلاعات هدیه ویژه
    elite_gift_title = serializers.SerializerMethodField()
    elite_gift_gift = serializers.SerializerMethodField()
    elite_gift_amount = serializers.SerializerMethodField()
    elite_gift_count = serializers.SerializerMethodField()
    
    # تعداد تجربیات VIP
    vip_experiences_count = serializers.SerializerMethodField()
    
    # اطلاعات نوع VIP برای نمایش badge
    has_vip = serializers.SerializerMethodField()
    has_vip_plus = serializers.SerializerMethodField()
    
    # روزهای باقی‌مانده تا پایان پکیج
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Package
        fields = [
            'id', 'business_id', 'business_name', 'is_active', 'start_date', 'end_date', 
            'status', 'status_display', 'is_complete', 'created_at', 'modified_at',
            'business_logo', 'business_image', 'business_category', 'city',
            'discount_percentage', 'specific_discount_title', 'specific_discount_percentage', 'specific_discount_description',
            'elite_gift_title', 'elite_gift_gift', 'elite_gift_amount', 'elite_gift_count',
            'vip_experiences_count', 'has_vip', 'has_vip_plus', 'days_remaining'
        ]
        read_only_fields = ['id', 'created_at', 'modified_at']
    
    def get_discount_percentage(self, obj):
        """درصد تخفیف کلی"""
        try:
            return obj.discount_all.percentage if hasattr(obj, 'discount_all') else None
        except:
            return None
    
    def get_specific_discount_title(self, obj):
        """عنوان تخفیف اختصاصی"""
        try:
            return obj.specific_discount.title if hasattr(obj, 'specific_discount') else None
        except:
            return None
    
    def get_specific_discount_percentage(self, obj):
        """درصد تخفیف اختصاصی"""
        try:
            return obj.specific_discount.percentage if hasattr(obj, 'specific_discount') else None
        except:
            return None
    
    def get_specific_discount_description(self, obj):
        """توضیحات تخفیف اختصاصی"""
        try:
            return obj.specific_discount.description if hasattr(obj, 'specific_discount') else None
        except:
            return None
    
    def get_elite_gift_title(self, obj):
        """عنوان هدیه ویژه"""
        try:
            return obj.elite_gift.gift if hasattr(obj, 'elite_gift') else None
        except:
            return None

    def get_elite_gift_gift(self, obj):
        """متن هدیه ویژه"""
        try:
            return obj.elite_gift.gift if hasattr(obj, 'elite_gift') else None
        except:
            return None
    
    def get_elite_gift_amount(self, obj):
        """مبلغ هدیه ویژه"""
        try:
            return obj.elite_gift.amount if hasattr(obj, 'elite_gift') else None
        except:
            return None
    
    def get_elite_gift_count(self, obj):
        """تعداد هدیه ویژه"""
        try:
            return obj.elite_gift.count if hasattr(obj, 'elite_gift') else None
        except:
            return None
    
    def get_vip_experiences_count(self, obj):
        """تعداد تجربیات VIP"""
        return obj.experiences.count()
    
    def get_has_vip(self, obj):
        """بررسی وجود تجربیات VIP"""
        return obj.experiences.filter(vip_experience_category__vip_type='VIP').exists()
    
    def get_has_vip_plus(self, obj):
        """بررسی وجود تجربیات VIP+"""
        return obj.experiences.filter(vip_experience_category__vip_type='VIP+').exists()
    
    def get_days_remaining(self, obj):
        """روزهای باقی‌مانده تا پایان پکیج"""
        if obj.end_date and obj.is_active:
            from django.utils import timezone
            today = timezone.now().date()
            if obj.end_date > today:
                return (obj.end_date - today).days
            else:
                return 0
        return None
    
    def get_business_logo(self, obj):
        """لوگوی کسب‌وکار"""
        try:
            business_profile = obj.business
            if business_profile and business_profile.logo:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(business_profile.logo.url)
                return business_profile.logo.url
        except Exception as e:
            print(f"Error getting business logo: {e}")
        return None
    
    def get_business_image(self, obj):
        """تصویر اصلی کسب‌وکار"""
        try:
            business_profile = obj.business
            if business_profile:
                # تصویر featured یا اولین تصویر گالری
                featured_image = business_profile.logo
                # if featured_image:
                #     request = self.context.get('request')
                #     if request:
                #         return request.build_absolute_uri(featured_image.image.url)
                #     return featured_image.image.url
        except Exception as e:
            print(f"Error getting business image: {e}")
        return None
    
    def get_business_category(self, obj):
        """دسته‌بندی کسب‌وکار"""
        try:
            business_profile = obj.business
            if business_profile and business_profile.category:
                return {
                    'id': business_profile.category.id,
                    'name': business_profile.category.name,
                    'icon': getattr(business_profile.category, 'icon', None)
                }
        except Exception as e:
            print(f"Error getting business category: {e}")
        return None

    def get_city(self, obj):
        """شهر کسب‌وکار"""
        try:
            business_profile = obj.business
            if business_profile and business_profile.city:
                return {
                    'id': business_profile.city.id,
                    'name': business_profile.city.name,
                }
        except Exception as e:
            print(f"Error getting business city: {e}")
        return None


class PackageDetailSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    discount_all = DiscountAllSerializer(read_only=True)
    specific_discount = SpecificDiscountSerializer(read_only=True)
    elite_gift = EliteGiftSerializer(read_only=True)
    experiences = VipExperienceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Package
        fields = [
            'id', 'business_name', 'is_active', 'start_date', 'end_date', 
            'status', 'status_display', 'is_complete', 'created_at', 'modified_at',
            'discount_all', 'specific_discount', 'elite_gift', 'experiences'
        ]
        read_only_fields = ['id', 'created_at', 'modified_at']


class PackageCreateUpdateSerializer(serializers.ModelSerializer):
    discount_all = DiscountAllSerializer(required=False)
    specific_discount = SpecificDiscountSerializer(required=False)
    elite_gift = EliteGiftSerializer(required=False)
    experiences = VipExperienceSerializer(many=True, required=False)
    
    class Meta:
        model = Package
        fields = [
            'id', 'business', 'is_active', 'start_date', 'end_date', 
            'status', 'is_complete', 'discount_all', 'specific_discount', 
            'elite_gift', 'experiences'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        discount_all_data = validated_data.pop('discount_all', None)
        specific_discount_data = validated_data.pop('specific_discount', None)
        elite_gift_data = validated_data.pop('elite_gift', None)
        experiences_data = validated_data.pop('experiences', [])
        
        package = Package.objects.create(**validated_data)
        
        if discount_all_data:
            DiscountAll.objects.create(package=package, **discount_all_data)
        
        if specific_discount_data:
            SpecificDiscount.objects.create(package=package, **specific_discount_data)
        
        if elite_gift_data:
            EliteGift.objects.create(package=package, **elite_gift_data)
        
        for experience_data in experiences_data:
            vip_experience_category_id = experience_data.pop('vip_experience_category_id')
            VipExperience.objects.create(
                package=package,
                vip_experience_category_id=vip_experience_category_id,
                **experience_data
            )
        
        return package
    
    def update(self, instance, validated_data):
        discount_all_data = validated_data.pop('discount_all', None)
        specific_discount_data = validated_data.pop('specific_discount', None)
        elite_gift_data = validated_data.pop('elite_gift', None)
        experiences_data = validated_data.pop('experiences', None)
        
        # Update package fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update related objects
        if discount_all_data:
            if hasattr(instance, 'discount_all'):
                for attr, value in discount_all_data.items():
                    setattr(instance.discount_all, attr, value)
                instance.discount_all.save()
            else:
                DiscountAll.objects.create(package=instance, **discount_all_data)
        
        if specific_discount_data:
            if hasattr(instance, 'specific_discount'):
                for attr, value in specific_discount_data.items():
                    setattr(instance.specific_discount, attr, value)
                instance.specific_discount.save()
            else:
                SpecificDiscount.objects.create(package=instance, **specific_discount_data)
        
        if elite_gift_data:
            if hasattr(instance, 'elite_gift'):
                # به‌روزرسانی elite_gift با پاک کردن فیلد مخالف
                elite_gift = instance.elite_gift
                elite_gift.gift = elite_gift_data.get('gift', elite_gift.gift)
                
                # اگر amount ارسال شده، count را پاک کن و برعکس
                if 'amount' in elite_gift_data and elite_gift_data['amount'] is not None:
                    elite_gift.amount = elite_gift_data['amount']
                    elite_gift.count = None
                elif 'count' in elite_gift_data and elite_gift_data['count'] is not None:
                    elite_gift.count = elite_gift_data['count']
                    elite_gift.amount = None
                else:
                    # اگر هیچ کدام ارسال نشده، فیلدهای موجود را حفظ کن
                    if 'amount' in elite_gift_data:
                        elite_gift.amount = elite_gift_data['amount']
                    if 'count' in elite_gift_data:
                        elite_gift.count = elite_gift_data['count']
                
                elite_gift.save()
            else:
                EliteGift.objects.create(package=instance, **elite_gift_data)
        
        if experiences_data is not None:
            # Delete existing experiences
            instance.experiences.all().delete()
            # Create new experiences
            for experience_data in experiences_data:
                vip_experience_category_id = experience_data.pop('vip_experience_category_id')
                VipExperience.objects.create(
                    package=instance,
                    vip_experience_category_id=vip_experience_category_id,
                    **experience_data
                )
        
        return instance


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['text', 'content_type', 'object_id']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                customer_profile = request.user.customerprofile
                validated_data['user'] = customer_profile
                return super().create(validated_data)
            except:
                raise serializers.ValidationError("User profile not found")
        raise serializers.ValidationError("User not authenticated")
