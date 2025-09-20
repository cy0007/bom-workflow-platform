from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Bom, BomDetail, SizeSpec


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """自定义用户管理界面"""
    list_display = ('username', 'email', 'role', 'department', 'is_staff', 'date_joined')
    list_filter = ('role', 'department', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = UserAdmin.fieldsets + (
        ('扩展信息', {'fields': ('role', 'phone', 'department')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('扩展信息', {'fields': ('role', 'phone', 'department')}),
    )


class BomDetailInline(admin.TabularInline):
    """BOM明细内联编辑"""
    model = BomDetail
    extra = 1
    fields = ('sequence', 'material_type', 'material_name', 'specification', 
             'usage_quantity', 'usage_unit', 'unit_price', 'supplier_name')


class SizeSpecInline(admin.TabularInline):
    """尺码规格内联编辑"""
    model = SizeSpec
    extra = 1
    fields = ('size', 'measurements', 'sort_order', 'is_active')


@admin.register(Bom)
class BomAdmin(admin.ModelAdmin):
    """BOM主表管理界面"""
    list_display = ('style_code', 'product_name', 'category', 'season', 'status', 'created_by', 'created_at')
    list_filter = ('status', 'category', 'season', 'year', 'created_by')
    search_fields = ('style_code', 'product_name', 'wave')
    readonly_fields = ('created_at', 'updated_at', 'confirmed_at')
    
    fieldsets = (
        ('基本信息', {
            'fields': ('style_code', 'product_name', 'category', 'season', 'year', 'wave')
        }),
        ('颜色和价格', {
            'fields': ('dev_colors', 'target_price', 'estimated_cost')
        }),
        ('规格信息', {
            'fields': ('fabric_composition', 'fabric_weight', 'care_instructions')
        }),
        ('状态管理', {
            'fields': ('status', 'version', 'created_by', 'assigned_to', 'notes')
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at', 'confirmed_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [BomDetailInline, SizeSpecInline]
    
    def save_model(self, request, obj, form, change):
        if not change:  # 新建时自动设置创建人
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(BomDetail)
class BomDetailAdmin(admin.ModelAdmin):
    """BOM明细管理界面"""
    list_display = ('bom', 'sequence', 'material_type', 'material_name', 'usage_quantity', 'usage_unit', 'unit_price', 'total_cost')
    list_filter = ('material_type', 'usage_unit', 'bom__category')
    search_fields = ('bom__style_code', 'material_name', 'specification', 'supplier_name')
    
    fieldsets = (
        ('基本信息', {
            'fields': ('bom', 'sequence', 'material_type', 'material_name', 'material_code', 'specification')
        }),
        ('供应商', {
            'fields': ('supplier_name', 'supplier_code')
        }),
        ('用量价格', {
            'fields': ('usage_quantity', 'usage_unit', 'unit_price')
        }),
        ('其他信息', {
            'fields': ('color_requirement', 'craft_requirement', 'notes')
        }),
    )


@admin.register(SizeSpec)
class SizeSpecAdmin(admin.ModelAdmin):
    """尺码规格管理界面"""
    list_display = ('bom', 'size', 'sort_order', 'is_active', 'created_at')
    list_filter = ('size', 'is_active', 'bom__category')
    search_fields = ('bom__style_code', 'bom__product_name')
    
    fieldsets = (
        ('基本信息', {
            'fields': ('bom', 'size', 'sort_order', 'is_active')
        }),
        ('尺寸规格', {
            'fields': ('measurements',)
        }),
    )
