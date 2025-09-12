from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import DiscountViewSet, CommentLikeAPIView

router = DefaultRouter()
router.register(r'discounts', DiscountViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('comments/<int:comment_id>/like/', CommentLikeAPIView.as_view(), name='comment-like'),
]
