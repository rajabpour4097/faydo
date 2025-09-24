from django.contrib import admin


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('id', 'business', 'score', 'is_active', 'start_date', 'end_date')
    search_fields = ('business__name', 'score', 'is_active', 'start_date', 'end_date')
    list_filter = ('business', 'score', 'is_active', 'start_date', 'end_date')
    list_per_page = 10
    list_display_links = ('id', 'business')
    list_editable = ('score', 'is_active', 'start_date', 'end_date')
    list_filter = ('business', 'score', 'is_active', 'start_date', 'end_date')

@admin.register(PackageComment)
class PackageCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'package', 'user', 'text')
    search_fields = ('package__business__name', 'user__username', 'text')
    list_filter = ('package', 'user')
    list_per_page = 10
    list_display_links = ('id', 'package')
    list_editable = ('text',)
    list_filter = ('package', 'user')

@admin.register(PackageCommentLike)
class PackageCommentLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'comment', 'user')
    search_fields = ('comment__package__business__name', 'user__username')
    list_filter = ('comment', 'user')
    list_per_page = 10
    list_display_links = ('id', 'comment')
    list_editable = ('user',)
    list_filter = ('comment', 'user')

@admin.register(VipExperienceCategory)
class VipExperienceCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'vip_type', 'category', 'name', 'description')
    search_fields = ('name', 'description')
    list_filter = ('vip_type', 'category')
    list_per_page = 10
    list_display_links = ('id', 'vip_type')
    list_editable = ('name', 'description')
    list_filter = ('vip_type', 'category')
