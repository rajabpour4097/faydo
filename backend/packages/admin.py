from django.contrib import admin
from .models import (
    DiscountAll, EliteGift, Package, SpecificDiscount, 
    VipExperience, VipExperienceCategory, Comment, CommentLike
)


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('id', 'business', 'is_active', 'is_complete', 'start_date', 'end_date', 'status')
    search_fields = ('business__name', 'is_active', 'is_complete', 'start_date', 'end_date')
    list_filter = ('business', 'is_active', 'is_complete', 'start_date', 'end_date', 'status')
    list_per_page = 10
    list_display_links = ('id', 'business')
    list_editable = ('is_active', 'is_complete', 'start_date', 'end_date')
    
    def save_model(self, request, obj, form, change):
        """
        Override save to allow manual activation/deactivation from admin
        """
        # علامت‌گذاری برای جلوگیری از signal automatic activation
        obj._admin_override = True
        super().save_model(request, obj, form, change)
    
    def save_related(self, request, form, formsets, change):
        """
        Override save_related to allow manual activation/deactivation from admin
        """
        # علامت‌گذاری برای جلوگیری از signal automatic activation
        form.instance._admin_override = True
        super().save_related(request, form, formsets, change)


@admin.register(VipExperienceCategory)
class VipExperienceCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'vip_type', 'club', 'category', 'name')
    search_fields = ('name',)
    list_filter = ('vip_type', 'club', 'category')


@admin.register(DiscountAll)
class DiscountAllAdmin(admin.ModelAdmin):
    list_display = ('id', 'percentage', 'score')
    search_fields = ('percentage', 'score')
    list_filter = ('percentage', 'score')
    list_per_page = 10
    list_editable = ('percentage', 'score')
    list_filter = ('percentage', 'score')

@admin.register(SpecificDiscount)
class SpecificDiscountAdmin(admin.ModelAdmin):
    list_display = ('id', 'percentage', 'score')
    search_fields = ('percentage', 'score')
    list_filter = ('percentage', 'score')
    list_per_page = 10
    list_editable = ('percentage', 'score')
    list_filter = ('percentage', 'score')

@admin.register(EliteGift)
class EliteGiftAdmin(admin.ModelAdmin):
    list_display = ('id', 'amount', 'count')
    search_fields = ('amount', 'count')
    list_filter = ('amount', 'count')
    list_per_page = 10
    list_editable = ('amount', 'count')
    list_filter = ('amount', 'count')

@admin.register(VipExperience)
class VipExperienceAdmin(admin.ModelAdmin):
    list_display = ('id', 'vip_experience_category', )
    search_fields = ('vip_experience_category',)
    list_filter = ('vip_experience_category')
    list_per_page = 10
    list_editable = ('vip_experience_category',)
    list_filter = ('vip_experience_category',)


class CommentLikeInline(admin.TabularInline):
    """Inline برای نمایش لایک‌های یک کامنت"""
    model = CommentLike
    extra = 0
    readonly_fields = ('user', 'created_at')
    can_delete = True


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'content_type', 'object_id', 'text_preview', 'score', 'likes_count', 'created_at')
    search_fields = ('user__user__first_name', 'user__user__last_name', 'text')
    list_filter = ('content_type', 'score', 'created_at')
    list_per_page = 20
    readonly_fields = ('content_type', 'object_id', 'created_at', 'modified_at', 'likes_count')
    inlines = [CommentLikeInline]
    
    fieldsets = (
        ('اطلاعات کاربر', {
            'fields': ('user',)
        }),
        ('محتوای کامنت', {
            'fields': ('text', 'score')
        }),
        ('ارتباط', {
            'fields': ('content_type', 'object_id'),
            'classes': ('collapse',)
        }),
        ('اطلاعات زمانی', {
            'fields': ('created_at', 'modified_at', 'likes_count'),
            'classes': ('collapse',)
        }),
    )
    
    def text_preview(self, obj):
        """نمایش پیش‌نمایش متن"""
        if obj.text:
            return obj.text[:50] + ('...' if len(obj.text) > 50 else '')
        return '-'
    text_preview.short_description = 'متن کامنت'
    
    def likes_count(self, obj):
        """تعداد لایک‌ها"""
        return obj.likes.count()
    likes_count.short_description = 'تعداد لایک'


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'comment', 'user', 'created_at')
    search_fields = ('user__user__first_name', 'user__user__last_name', 'comment__text')
    list_filter = ('created_at',)
    list_per_page = 20
    readonly_fields = ('comment', 'user', 'created_at')
    
    def has_add_permission(self, request):
        """جلوگیری از افزودن دستی لایک از پنل ادمین"""
        return False
