from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Category, Business, Offer, UserOffer, 
    Review, ReviewReply, Notification
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    level = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProfile
    fields = ['user', 'user_type', 'points', 'interests', 'achievements', 'phone', 'avatar', 'level']
    read_only_fields = ['points', 'achievements']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'description']


class BusinessSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Business
        fields = [
            'id', 'name', 'slug', 'category', 'logo', 'description', 
            'address', 'phone', 'email', 'website', 'is_active'
        ]


class OfferSerializer(serializers.ModelSerializer):
    business = BusinessSerializer(read_only=True)
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'business', 'title', 'description', 'percent', 
            'min_points', 'start_date', 'end_date', 'is_available'
        ]


class UserOfferSerializer(serializers.ModelSerializer):
    offer = OfferSerializer(read_only=True)
    
    class Meta:
        model = UserOffer
        fields = ['id', 'offer', 'is_saved', 'is_used', 'used_at', 'created_at']


class ReviewReplySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ReviewReply
        fields = ['id', 'user', 'text', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    business = BusinessSerializer(read_only=True)
    replies = ReviewReplySerializer(many=True, read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'business', 'rating', 'text', 'likes', 'replies', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']


class DashboardSerializer(serializers.Serializer):
    """سریالایزر برای داده‌های داشبورد"""
    user_profile = UserProfileSerializer()
    recommended_offers = OfferSerializer(many=True)
    notifications = NotificationSerializer(many=True)
    progress = serializers.DictField()
