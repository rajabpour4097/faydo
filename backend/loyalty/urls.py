from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerLoyaltyViewSet, TransactionViewSet,
    get_business_by_code, EliteGiftClaimViewSet,
    elite_gift_progress,
    points_summary, points_history,
    award_story_share, award_favorite_business,
)

router = DefaultRouter()
router.register(r'loyalties', CustomerLoyaltyViewSet, basename='loyalty')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'elite-gift-claims', EliteGiftClaimViewSet, basename='elite-gift-claim')

urlpatterns = [
    path('', include(router.urls)),
    path('business-by-code/', get_business_by_code, name='business-by-code'),
    path('elite-gift-progress/<int:package_id>/', elite_gift_progress, name='elite-gift-progress'),
    # Points & Tier
    path('points-summary/', points_summary, name='points-summary'),
    path('points-history/', points_history, name='points-history'),
    path('story-share/', award_story_share, name='story-share'),
    path('favorite/', award_favorite_business, name='favorite-points'),
]
