from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, ServiceCategoryViewSet, ProvinceViewSet, CityViewSet,
    BusinessProfileViewSet, CustomerProfileViewSet, ITManagerProfileViewSet,
    ProjectManagerProfileViewSet, SupporterProfileViewSet, FinancialManagerProfileViewSet,
    register_view, business_register_view, login_view, logout_view, profile_view
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
    
    # API endpoints
    path('', include(router.urls)),
]
