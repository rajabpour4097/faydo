from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, UserProfileViewSet, CategoryViewSet, 
    BusinessViewSet, OfferViewSet, UserOfferViewSet,
    ReviewViewSet, NotificationViewSet, RegisterView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'businesses', BusinessViewSet)
router.register(r'offers', OfferViewSet)
router.register(r'user-offers', UserOfferViewSet, basename='useroffer')
router.register(r'reviews', ReviewViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
]
