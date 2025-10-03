from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'packages', views.PackageViewSet, basename='package')
router.register(r'vip-experiences', views.VipExperienceCategoryViewSet, basename='vip-experience')

urlpatterns = [
    path('', include(router.urls)),
]
