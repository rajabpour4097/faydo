from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, ServiceCategory, Province, City, BusinessProfile, CustomerProfile,
    ITManagerProfile, ProjectManagerProfile, SupporterProfile, FinancialManagerProfile
)


class CustomerRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    last_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    gender = serializers.ChoiceField(choices=[('male', 'مرد'), ('female', 'زن')], required=False, allow_null=True)
    birth_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = CustomerProfile
        fields = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'password', 'password_confirm', 'gender', 'birth_date', 'address']

    def validate(self, attrs):
        password = attrs.get('password', '')
        password_confirm = attrs.get('password_confirm', '')
        
        # Only validate passwords if they are provided
        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        # Extract user data
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email', ''),
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
            'phone_number': validated_data.pop('phone_number'),
            'role': 'customer'
        }
        
        validated_data.pop('password_confirm', '')
        password = validated_data.pop('password', '')
        
        # If user did not supply first/last name set friendly default for display purposes
        if not (user_data['first_name'] or user_data['last_name']):
            user_data['first_name'] = 'کاربر جدید'
            user_data['last_name'] = ''

        # Create user
        user = User.objects.create_user(**user_data)
        if password:
            user.set_password(password)
        user.save()
        
        # Create customer profile
        customer_profile = CustomerProfile.objects.create(
            user=user,
            **validated_data
        )
        
        return customer_profile


class BusinessRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    name = serializers.CharField(required=False, allow_blank=True, allow_null=True)  # Business name
    description = serializers.CharField(required=False, default='', allow_blank=True)
    address = serializers.CharField(required=False, default='', allow_blank=True)
    business_location_latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True, default=None)
    business_location_longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True, default=None)

    class Meta:
        model = BusinessProfile
        fields = ['username', 'email', 'phone_number', 'password', 'password_confirm', 'name', 'description', 'address', 'business_location_latitude', 'business_location_longitude', 'category', 'city']
        extra_kwargs = {
            'category': {'required': False, 'allow_null': True},
            'city': {'required': False, 'allow_null': True},
        }

    def validate(self, attrs):
        password = attrs.get('password', '')
        password_confirm = attrs.get('password_confirm', '')
        
        # Only validate passwords if they are provided
        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        # Extract user data
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email', ''),
            'phone_number': validated_data.pop('phone_number'),
            'role': 'business'
        }
        
        validated_data.pop('password_confirm', '')
        password = validated_data.pop('password', '')
        
        # Create user
        user = User.objects.create_user(**user_data)
        if password:
            user.set_password(password)
        user.save()
        
        # Create business profile
        # Assign default business name if none provided
        if not validated_data.get('name'):
            validated_data['name'] = 'کاربر جدید'

        business_profile = BusinessProfile.objects.create(
            user=user,
            **validated_data
        )
        
        return business_profile


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # First try to authenticate with username
            user = authenticate(username=username, password=password)
            
            # If that fails, try to authenticate with phone number
            if not user:
                try:
                    user_obj = User.objects.get(phone_number=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Username/phone number and password required')


class UserProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'image', 'date_joined', 'last_login', 'display_name']
        read_only_fields = ['id', 'username', 'date_joined', 'last_login']

    def get_display_name(self, obj):
        # Prefer business name if business
        if obj.role == 'business':
            bp = getattr(obj, 'businessprofile', None)
            if bp and bp.name:
                return bp.name
            return 'کاربر جدید'
        name = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return name if name else 'کاربر جدید'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Normalize null -> '' for common textual fields
        for key in ['email', 'first_name', 'last_name', 'image']:
            if rep.get(key) is None:
                rep[key] = ''
        return rep
class ServiceCategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = ServiceCategory
		fields = ['id', 'name', 'description', 'parent']


class ProvinceSerializer(serializers.ModelSerializer):
	class Meta:
		model = Province
		fields = ['id', 'name']


class CitySerializer(serializers.ModelSerializer):
	province = ProvinceSerializer(read_only=True)
	province_id = serializers.PrimaryKeyRelatedField(
		queryset=Province.objects.all(), source='province', write_only=True
	)

	class Meta:
		model = City
		fields = ['id', 'name', 'province', 'province_id']


class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'phone_number', 'image']
		read_only_fields = ['id']


class BusinessProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='business'), source='user', write_only=True)

    class Meta:
        model = BusinessProfile
        fields = [
            'id', 'user', 'user_id', 'name', 'description', 'category', 'address',
            'rating_avg', 'business_location_latitude', 'business_location_longitude', 'city'
        ]
        read_only_fields = ['rating_avg']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if not rep.get('name'):
            rep['name'] = 'کاربر جدید'
        for key, val in rep.items():
            if val is None:
                rep[key] = ''
        return rep


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='customer'), source='user', write_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            'id', 'user', 'user_id', 'gender', 'birth_date', 'membership_level', 'points', 'address'
        ]
        read_only_fields = ['points']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        for key, val in rep.items():
            if val is None:
                rep[key] = ''
        return rep


class ITManagerProfileSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='it_manager'), source='user', write_only=True)

	class Meta:
		model = ITManagerProfile
		fields = ['id', 'user', 'user_id', 'is_staff']


class ProjectManagerProfileSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='project_manager'), source='user', write_only=True)

	class Meta:
		model = ProjectManagerProfile
		fields = ['id', 'user', 'user_id', 'is_manager']


class SupporterProfileSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='supporter'), source='user', write_only=True)

	class Meta:
		model = SupporterProfile
		fields = ['id', 'user', 'user_id', 'is_supporter']


class FinancialManagerProfileSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='financial_manager'), source='user', write_only=True)

	class Meta:
		model = FinancialManagerProfile
		fields = ['id', 'user', 'user_id', 'is_financial_manager']
