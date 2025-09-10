from django.contrib import admin
from .models import Discount



@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'business_name', 'percentage', 'start_date', 'end_date',)
    search_fields = ('title', 'business_name')
    
    def business_name(self, obj):
        return obj.business.name
