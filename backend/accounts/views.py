from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import login
from .models import (
    User, ServiceCategory, Province, City, BusinessProfile, CustomerProfile,
    ITManagerProfile, ProjectManagerProfile, SupporterProfile, FinancialManagerProfile
)
from .serializers import *


class RequireCompleteProfile(permissions.BasePermission):
    """
    Custom permission that requires customer users to have complete profiles
    """
    message = 'Profile must be completed before accessing this resource.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Only apply to customers
        if request.user.role != 'customer':
            return True
            
        try:
            customer_profile = CustomerProfile.objects.get(user=request.user)
            return customer_profile.is_profile_complete()
        except CustomerProfile.DoesNotExist:
            return False


def _serialize_user_with_absolute_image(user, request):
    """Return serialized user data ensuring image field is absolute URL if present."""
    data = UserProfileSerializer(user).data
    if user.image:
        try:
            data['image'] = request.build_absolute_uri(user.image.url)
        except Exception:
            # Fallback silently keeps original relative path
            pass
    return data
from .sms_service import sms_service


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Customer registration endpoint"""
    serializer = CustomerRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        customer_profile = serializer.save()
        user = customer_profile.user
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Customer created successfully',
            'user': _serialize_user_with_absolute_image(user, request),
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def business_register_view(request):
    """Business registration endpoint"""
    serializer = BusinessRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        business_profile = serializer.save()
        user = business_profile.user
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Business created successfully',
            'user': _serialize_user_with_absolute_image(user, request),
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'user': _serialize_user_with_absolute_image(user, request),
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get or update current user profile with role-specific profile data"""
    user = request.user
    
    if request.method == 'GET':
        user_data = _serialize_user_with_absolute_image(user, request)

        # Add role-specific profile data
        profile_data = None
        if user.role == 'customer':
            try:
                customer_profile = CustomerProfile.objects.select_related('city').get(user=user)
                profile_data = CustomerProfileSerializer(customer_profile).data
            except CustomerProfile.DoesNotExist:
                profile_data = None
        elif user.role == 'business':
            try:
                business_profile = BusinessProfile.objects.get(user=user)
                profile_data = BusinessProfileSerializer(business_profile).data
            except BusinessProfile.DoesNotExist:
                profile_data = None

        return Response({
            'user': user_data,
            'profile': profile_data,
            'role': user.role
        })
    
    elif request.method == 'PUT':
        # Update user profile
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            # Re-serialize to ensure absolute image URL if updated
            return Response(_serialize_user_with_absolute_image(updated_user, request))
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp_view(request):
    """Send OTP code to phone number"""
    phone_number = request.data.get('phone_number')
    
    if not phone_number:
        return Response({
            'success': False,
            'message': 'شماره تماس الزامی است'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate Iranian phone number format
    if not phone_number.startswith('09') or len(phone_number) != 11:
        return Response({
            'success': False,
            'message': 'شماره تماس معتبر نیست'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    result = sms_service.send_otp(phone_number)
    
    if result['success']:
        return Response({
            'success': True,
            'message': result['message'],
            'otp_code': result.get('otp_code')  # Remove this in production
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'success': False,
            'message': result['message']
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    """Verify OTP code"""
    phone_number = request.data.get('phone_number')
    otp_code = request.data.get('otp_code')
    
    if not phone_number or not otp_code:
        return Response({
            'success': False,
            'message': 'شماره تماس و کد تایید الزامی است'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    result = sms_service.verify_otp(phone_number, otp_code)
    
    if result['success']:
        return Response({
            'success': True,
            'message': result['message']
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'success': False,
            'message': result['message']
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_with_otp_view(request):
    """Login with phone number after OTP verification"""
    phone_number = request.data.get('phone_number')
    
    if not phone_number:
        return Response({
            'success': False,
            'message': 'شماره تماس الزامی است'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find user by phone number
        user = User.objects.get(phone_number=phone_number)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'ورود موفق',
            'user': _serialize_user_with_absolute_image(user, request),
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'کاربری با این شماره یافت نشد'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_image_view(request):
    """Upload profile image"""
    if 'image' not in request.FILES:
        return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']

    # Basic content type validation (extend as needed)
    allowed_types = {'image/jpeg', 'image/png', 'image/webp'}  # add 'image/heic' if you support it
    if image_file.content_type not in allowed_types:
        return Response({
            'error': 'فرمت تصویر پشتیبانی نمی‌شود. فقط JPG, PNG, WEBP.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Optional size limit: 5MB
    max_bytes = 5 * 1024 * 1024
    if image_file.size > max_bytes:
        return Response({'error': 'حجم تصویر نباید بیش از 5 مگابایت باشد.'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    user.image = image_file
    user.save()

    absolute_url = request.build_absolute_uri(user.image.url) if user.image else None
    return Response({
        'message': 'Profile image uploaded successfully',
        'image': absolute_url
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_phone_view(request):
    """Update phone number with OTP verification"""
    phone_number = request.data.get('phone_number')
    otp_code = request.data.get('otp_code')
    
    if not phone_number or not otp_code:
        return Response({'error': 'Phone number and OTP code are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify OTP using the SMS service
    result = sms_service.verify_otp(phone_number, otp_code)
    
    if result['success']:
        user = request.user
        user.phone_number = phone_number
        user.save()
        return Response(_serialize_user_with_absolute_image(user, request))
    else:
        return Response({'error': result['message']}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_business_profile_view(request):
    """Update business profile data"""
    user = request.user
    
    if user.role != 'business':
        return Response({'error': 'Only business users can update business profile'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        business_profile = BusinessProfile.objects.get(user=user)
    except BusinessProfile.DoesNotExist:
        return Response({'error': 'Business profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Update business profile fields
    if 'business_name' in request.data:
        business_profile.name = request.data['business_name']
    if 'description' in request.data:
        business_profile.description = request.data['description']
    if 'address' in request.data:
        business_profile.address = request.data['address']
    
    business_profile.save()
    
    return Response({
        'message': 'Business profile updated successfully',
        'business_profile': BusinessProfileSerializer(business_profile).data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_customer_profile_view(request):
    """Update customer profile data"""
    user = request.user
    
    if user.role != 'customer':
        return Response({'error': 'Only customer users can update customer profile'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        customer_profile = CustomerProfile.objects.get(user=user)
    except CustomerProfile.DoesNotExist:
        return Response({'error': 'Customer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Update customer profile fields
    if 'gender' in request.data:
        customer_profile.gender = request.data['gender']
    if 'birth_date' in request.data:
        customer_profile.birth_date = request.data['birth_date'] or None
    if 'address' in request.data:
        customer_profile.address = request.data['address']
    if 'city_id' in request.data:
        try:
            city = City.objects.get(id=request.data['city_id'])
            customer_profile.city = city
        except City.DoesNotExist:
            pass
    elif 'city' in request.data and isinstance(request.data['city'], dict):
        # Handle city name-based update (would need proper city lookup)
        city_name = request.data['city'].get('name')
        if city_name:
            try:
                city = City.objects.filter(name__icontains=city_name).first()
                if city:
                    customer_profile.city = city
            except:
                pass
    
    customer_profile.save()
    
    # Return updated profile data
    user_data = _serialize_user_with_absolute_image(user, request)
    profile_data = CustomerProfileSerializer(customer_profile).data
    
    return Response({
        'user': user_data,
        'profile': profile_data,
        'role': user.role
    })
class BaseReadWriteViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.AllowAny]


class UserViewSet(BaseReadWriteViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer


class ServiceCategoryViewSet(BaseReadWriteViewSet):
	queryset = ServiceCategory.objects.all()
	serializer_class = ServiceCategorySerializer


class ProvinceViewSet(BaseReadWriteViewSet):
	queryset = Province.objects.all()
	serializer_class = ProvinceSerializer


class CityViewSet(BaseReadWriteViewSet):
	queryset = City.objects.select_related('province').all()
	serializer_class = CitySerializer


class BusinessProfileViewSet(BaseReadWriteViewSet):
	queryset = BusinessProfile.objects.select_related('user').all()
	serializer_class = BusinessProfileSerializer


class CustomerProfileViewSet(BaseReadWriteViewSet):
	queryset = CustomerProfile.objects.select_related('user').all()
	serializer_class = CustomerProfileSerializer


class ITManagerProfileViewSet(BaseReadWriteViewSet):
	queryset = ITManagerProfile.objects.select_related('user').all()
	serializer_class = ITManagerProfileSerializer


class ProjectManagerProfileViewSet(BaseReadWriteViewSet):
	queryset = ProjectManagerProfile.objects.select_related('user').all()
	serializer_class = ProjectManagerProfileSerializer


class SupporterProfileViewSet(BaseReadWriteViewSet):
	queryset = SupporterProfile.objects.select_related('user').all()
	serializer_class = SupporterProfileSerializer


class FinancialManagerProfileViewSet(BaseReadWriteViewSet):
	queryset = FinancialManagerProfile.objects.select_related('user').all()
	serializer_class = FinancialManagerProfileSerializer

