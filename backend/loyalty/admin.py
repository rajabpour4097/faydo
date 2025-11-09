from django.contrib import admin
from .models import CustomerLoyalty, Transaction, EliteGiftClaim


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


@admin.register(EliteGiftClaim)
class EliteGiftClaimAdmin(admin.ModelAdmin):
    list_display = [
        'customer', 'get_customer_name', 'business', 'get_gift_name',
        'status', 'created_at', 'approved_at'
    ]
    list_filter = ['status', 'business', 'created_at', 'approved_at']
    search_fields = [
        'customer__user__first_name', 'customer__user__last_name',
        'business__name', 'elite_gift__gift'
    ]
    readonly_fields = [
        'customer', 'elite_gift', 'package', 'business',
        'progress_at_claim', 'created_at', 'modified_at',
        'approved_at', 'used_at'
    ]
    
    fieldsets = (
        ('اطلاعات درخواست', {
            'fields': ('customer', 'elite_gift', 'package', 'business')
        }),
        ('پیشرفت هنگام درخواست', {
            'fields': ('progress_at_claim',)
        }),
        ('وضعیت', {
            'fields': ('status', 'business_note')
        }),
        ('تاریخ‌ها', {
            'fields': ('created_at', 'approved_at', 'used_at', 'modified_at')
        }),
    )
    
    def get_customer_name(self, obj):
        return obj.customer.user.get_full_name()
    get_customer_name.short_description = 'نام مشتری'
    
    def get_gift_name(self, obj):
        return obj.elite_gift.gift
    get_gift_name.short_description = 'نام هدیه'
    
    actions = ['approve_claims', 'reject_claims', 'mark_as_used']
    
    def approve_claims(self, request, queryset):
        """
        تایید دسته‌ای درخواست‌ها
        """
        count = 0
        for claim in queryset.filter(status='pending'):
            try:
                claim.approve()
                count += 1
            except ValueError:
                pass
        
        self.message_user(request, f'{count} درخواست تایید شد.')
    approve_claims.short_description = 'تایید درخواست‌های انتخاب شده'
    
    def reject_claims(self, request, queryset):
        """
        رد دسته‌ای درخواست‌ها
        """
        count = 0
        for claim in queryset.filter(status='pending'):
            try:
                claim.reject()
                count += 1
            except ValueError:
                pass
        
        self.message_user(request, f'{count} درخواست رد شد.')
    reject_claims.short_description = 'رد درخواست‌های انتخاب شده'
    
    def mark_as_used(self, request, queryset):
        """
        علامت‌گذاری به عنوان استفاده شده
        """
        count = 0
        for claim in queryset.filter(status='approved'):
            try:
                claim.mark_as_used()
                count += 1
            except ValueError:
                pass
        
        self.message_user(request, f'{count} درخواست به عنوان استفاده شده علامت‌گذاری شد.')
    mark_as_used.short_description = 'علامت‌گذاری به عنوان استفاده شده'
