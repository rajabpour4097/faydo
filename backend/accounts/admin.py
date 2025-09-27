from django.contrib import admin

from accounts.models import *


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'role')
    search_fields = ('username', 'email', 'role')
    list_filter = ('role',)
    list_per_page = 10
    list_display_links = ('id', 'username')

@admin.register(BusinessProfile)
class BusinessProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'get_owner_username', 'city', 'category')
    search_fields = ('name', 'user__username', 'city__name')
    list_filter = ('city', 'category')
    
    def get_owner_username(self, obj):
        return obj.user.username
    get_owner_username.short_description = 'Owner'

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_full_name', 'gender', 'membership_level', 'points', 'city')
    search_fields = ('user__first_name', 'user__last_name', 'user__username', 'city__name')
    list_filter = ('gender', 'membership_level', 'city')

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'نام کامل'

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')
    search_fields = ('name',) 


@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'province')
    search_fields = ('name', 'province__name')
    list_filter = ('province',)
    list_per_page = 50