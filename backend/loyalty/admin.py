from django.contrib import admin
from .models import CustomerLoyalty, Transaction


@admin.register(CustomerLoyalty)
class CustomerLoyaltyAdmin(admin.ModelAdmin):
    list_display = ['customer', 'business', 'points', 'vip_status', 'elite_gift_target_reached', 'elite_gift_used']
    list_filter = ['vip_status', 'elite_gift_target_reached', 'elite_gift_used', 'business']
    search_fields = ['customer__user__first_name', 'customer__user__last_name', 'business__name']
    readonly_fields = ['created_at', 'modified_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'customer', 'business', 'original_amount', 'final_amount', 
        'points_earned', 'status', 'created_at'
    ]
    list_filter = ['status', 'business', 'created_at']
    search_fields = ['customer__user__first_name', 'customer__user__last_name', 'business__name']
    readonly_fields = ['created_at', 'modified_at', 'discount_all_amount', 'special_discount_amount', 'final_amount']
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('customer', 'business', 'package', 'loyalty')
        }),
        ('مبالغ', {
            'fields': (
                'original_amount', 'discount_all_amount',
                'has_special_discount', 'special_discount_title',
                'special_discount_original_amount', 'special_discount_amount',
                'final_amount', 'points_earned'
            )
        }),
        ('وضعیت', {
            'fields': ('status', 'note')
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'modified_at')
        }),
    )
