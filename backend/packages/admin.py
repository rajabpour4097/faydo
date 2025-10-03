from django.contrib import admin
from .models import DiscountAll, EliteGift, Package, SpecificDiscount, VipExperience, VipExperienceCategory


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('id', 'business', 'is_active', 'start_date', 'end_date')
    search_fields = ('business__name', 'is_active', 'start_date', 'end_date')
    list_filter = ('business',  'is_active', 'start_date', 'end_date')
    list_per_page = 10
    list_display_links = ('id', 'business')
    list_editable = ('is_active', 'start_date', 'end_date')
    list_filter = ('business', 'is_active', 'start_date', 'end_date')


@admin.register(VipExperienceCategory)
class VipExperienceCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'vip_type', 'category', 'name')
    search_fields = ('name',)
    list_filter = ('vip_type', 'category')
    list_per_page = 10
    list_display_links = ('id', 'vip_type')
    list_editable = ('name',)
    list_filter = ('vip_type', 'category')


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
