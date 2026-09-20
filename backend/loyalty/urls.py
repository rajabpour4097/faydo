from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerLoyaltyViewSet, TransactionViewSet,
    get_business_by_code, EliteGiftClaimViewSet,
    elite_gift_progress,
    points_summary, points_history,
    award_story_share, award_favorite_business,
    CustomerFavoriteViewSet,
    cashback_summary,
)
from .dashboard_views import (
    business_dashboard,
    business_customers,
    business_create_transaction,
    business_transactions_summary,
    business_transactions_export,
)

router = DefaultRouter()
router.register(r'loyalties', CustomerLoyaltyViewSet, basename='loyalty')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'elite-gift-claims', EliteGiftClaimViewSet, basename='elite-gift-claim')
router.register(r'favorites', CustomerFavoriteViewSet, basename='customer-favorite')

urlpatterns = [
    path('', include(router.urls)),
    path('business-by-code/', get_business_by_code, name='business-by-code'),
    path('elite-gift-progress/<int:package_id>/', elite_gift_progress, name='elite-gift-progress'),
    # Points & Tier
    path('points-summary/', points_summary, name='points-summary'),
    path('points-history/', points_history, name='points-history'),
    path('cashback-summary/', cashback_summary, name='cashback-summary'),
    path('business-dashboard/', business_dashboard, name='business-dashboard'),
    path('business-customers/', business_customers, name='business-customers'),
    path('business-create-transaction/', business_create_transaction, name='business-create-transaction'),
    path('business-transactions-summary/', business_transactions_summary, name='business-transactions-summary'),
    path('business-transactions-export/', business_transactions_export, name='business-transactions-export'),
    path('story-share/', award_story_share, name='story-share'),
    path('favorite/', award_favorite_business, name='favorite-points'),
]
