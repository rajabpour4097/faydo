from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, ServiceCategoryViewSet, ProvinceViewSet, CityViewSet,
    BusinessProfileViewSet, CustomerProfileViewSet, ITManagerProfileViewSet,
    ProjectManagerProfileViewSet, SupporterProfileViewSet, FinancialManagerProfileViewSet,
    register_view, business_register_view, login_view, logout_view, profile_view,
    send_otp_view, verify_otp_view, login_with_otp_view, upload_profile_image_view, update_phone_view, update_business_profile_view
)

# API Router for ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'service-categories', ServiceCategoryViewSet)
router.register(r'provinces', ProvinceViewSet)
router.register(r'cities', CityViewSet)
router.register(r'business-profiles', BusinessProfileViewSet)
router.register(r'customer-profiles', CustomerProfileViewSet)
router.register(r'it-managers', ITManagerProfileViewSet)
router.register(r'project-managers', ProjectManagerProfileViewSet)
router.register(r'supporters', SupporterProfileViewSet)
router.register(r'financial-managers', FinancialManagerProfileViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/register/business/', business_register_view, name='business_register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', profile_view, name='profile'),
    
    # OTP endpoints
    path('auth/send-otp/', send_otp_view, name='send_otp'),
    path('auth/verify-otp/', verify_otp_view, name='verify_otp'),
    path('auth/login-with-otp/', login_with_otp_view, name='login_with_otp'),
    
    # Profile management endpoints
    path('auth/profile/image/', upload_profile_image_view, name='upload_profile_image'),
    path('auth/profile/phone/', update_phone_view, name='update_phone'),
    path('auth/profile/business/', update_business_profile_view, name='update_business_profile'),
    
    # API endpoints
    path('', include(router.urls)),
]
