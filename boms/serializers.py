from rest_framework import serializers
from .models import Bom, BomDetail, SizeSpec, User


class BomSerializer(serializers.ModelSerializer):
    """BOM序列化器 - 用于API数据序列化"""
    dev_colors_list = serializers.ReadOnlyField()  # 使用模型中的属性
    total_cost = serializers.SerializerMethodField()  # 计算总成本
    
    class Meta:
        model = Bom
        fields = [
            'style_code', 'product_name', 'season', 'year', 'wave', 'category',
            'dev_colors', 'dev_colors_list', 'target_price', 'estimated_cost', 
            'total_cost', 'fabric_composition', 'fabric_weight', 'care_instructions', 
            'status', 'version', 'notes', 'created_at', 'updated_at', 'confirmed_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'confirmed_at', 'total_cost']
    
    def get_total_cost(self, obj):
        """计算BOM总成本"""
        return obj.get_total_cost()
