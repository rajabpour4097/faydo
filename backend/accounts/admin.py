from django.contrib import admin

from accounts.models import BusinessProfile, CustomerProfile


@admin.register(BusinessProfile)
class BusinessProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'get_owner_username')
    search_fields = ('name', 'user__username')
    
    def get_owner_username(self, obj):
        return obj.user.username
    get_owner_username.short_description = 'Owner'

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_full_name', 'gender', 'membership_level', 'points')

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'نام کامل'
 
