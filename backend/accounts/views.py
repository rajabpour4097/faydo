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
from .serializers import (
    UserSerializer, ServiceCategorySerializer, ProvinceSerializer, CitySerializer,
    BusinessProfileSerializer, CustomerProfileSerializer, ITManagerProfileSerializer,
    ProjectManagerProfileSerializer, SupporterProfileSerializer, FinancialManagerProfileSerializer,
    CustomerRegistrationSerializer, BusinessRegistrationSerializer, UserLoginSerializer, UserProfileSerializer
)


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
            'user': UserProfileSerializer(user).data,
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
            'user': UserProfileSerializer(user).data,
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
            'user': UserProfileSerializer(user).data,
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user profile with role-specific profile data"""
    user = request.user
    user_data = UserProfileSerializer(user).data
    
    # Add role-specific profile data
    profile_data = None
    if user.role == 'customer':
        try:
            customer_profile = CustomerProfile.objects.get(user=user)
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

