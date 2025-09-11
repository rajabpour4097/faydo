from django.contrib import admin
from .models import Discount, DiscountComment



@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'business_name', 'percentage', 'start_date', 'end_date',)
    search_fields = ('title', 'business_name')
    
    def business_name(self, obj):
        return obj.business.name

@admin.register(DiscountComment)
class DiscountCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'discount', 'user', 'comment', 'created_at')
    search_fields = ('comment',)
