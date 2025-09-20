from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Bom
from .serializers import BomSerializer


class BomListView(generics.ListAPIView):
    """
    BOM列表视图 - 只读API
    
    支持功能：
    - 排序: ?ordering=-created_at
    - 搜索: ?search=款式编码或产品名称
    - 过滤: ?status=DRAFT&category=TOP
    """
    queryset = Bom.objects.select_related('created_by', 'assigned_to').order_by('-created_at')
    serializer_class = BomSerializer
    permission_classes = [AllowAny]  # 临时允许匿名访问，用于前端测试
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'season', 'year']
    search_fields = ['style_code', 'product_name', 'wave']
    ordering_fields = ['created_at', 'updated_at', 'style_code', 'product_name']
    ordering = ['-created_at']


class BomDetailView(generics.RetrieveUpdateAPIView):
    """
    BOM详情视图 - 支持获取和更新单个BOM
    
    支持操作：
    - GET: 获取单个BOM详情
    - PATCH: 部分更新BOM字段
    - PUT: 完整更新BOM（需要所有必填字段）
    """
    queryset = Bom.objects.select_related('created_by', 'assigned_to')
    serializer_class = BomSerializer
    permission_classes = [AllowAny]  # 临时允许匿名访问，用于前端测试
    lookup_field = 'style_code'
