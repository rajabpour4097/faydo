from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import DiscountViewSet

router = DefaultRouter()
router.register(r'discounts', DiscountViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
