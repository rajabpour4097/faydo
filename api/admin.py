from django.contrib import admin
from .models import (
    UserProfile, Category, Business, Offer, UserOffer, 
    Review, ReviewReply, Notification
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'points', 'phone', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'business', 'percent', 'min_points', 'is_active', 'start_date', 'end_date']
    list_filter = ['business__category', 'is_active', 'start_date', 'end_date']
    search_fields = ['title', 'business__name']
    date_hierarchy = 'start_date'


@admin.register(UserOffer)
class UserOfferAdmin(admin.ModelAdmin):
    list_display = ['user', 'offer', 'is_saved', 'is_used', 'used_at', 'created_at']
    list_filter = ['is_saved', 'is_used', 'created_at']
    search_fields = ['user__username', 'offer__title']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'business', 'rating', 'likes', 'created_at']
    list_filter = ['rating', 'created_at', 'business__category']
    search_fields = ['user__username', 'business__name', 'text']


@admin.register(ReviewReply)
class ReviewReplyAdmin(admin.ModelAdmin):
    list_display = ['user', 'review', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'text']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['user__username', 'title', 'message']
