from django.contrib import admin
from .models import Package, VipExperienceCategory


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
