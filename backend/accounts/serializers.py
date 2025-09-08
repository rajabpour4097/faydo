from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, ServiceCategory, Province, City, BusinessProfile, CustomerProfile,
    ITManagerProfile, ProjectManagerProfile, SupporterProfile, FinancialManagerProfile
)


class CustomerRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    gender = serializers.ChoiceField(choices=[('male', 'مرد'), ('female', 'زن')])
    birth_date = serializers.DateField()

    class Meta:
        model = CustomerProfile
        fields = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'password', 'password_confirm', 'gender', 'birth_date', 'address']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        # Extract user data
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone_number': validated_data.pop('phone_number'),
            'role': 'customer'
        }
        
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(**user_data)
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
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    name = serializers.CharField()  # Business name
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
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        # Extract user data
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'phone_number': validated_data.pop('phone_number'),
            'role': 'business'
        }
        
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(**user_data)
        user.set_password(password)
        user.save()
        
        # Create business profile
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
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Username and password required')


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'image', 'date_joined', 'last_login']
        read_only_fields = ['id', 'username', 'date_joined', 'last_login']
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
		fields = ['id', 'user', 'user_id', 'name', 'description', 'category', 'address', 'rating_avg', 'business_location_latitude', 'business_location_longitude', 'city']
		read_only_fields = ['rating_avg']


class CustomerProfileSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='customer'), source='user', write_only=True)

	class Meta:
		model = CustomerProfile
		fields = ['id', 'user', 'user_id', 'gender', 'birth_date', 'membership_level', 'points', 'address']
		read_only_fields = ['points']


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
