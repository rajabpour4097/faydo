from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerLoyaltyViewSet, TransactionViewSet, get_business_by_code

router = DefaultRouter()
router.register(r'loyalties', CustomerLoyaltyViewSet, basename='loyalty')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('business-by-code/', get_business_by_code, name='business-by-code'),
]
