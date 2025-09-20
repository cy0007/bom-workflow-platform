from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Bom
from .serializers import BomSerializer


class BomListView(generics.ListAPIView):
    """BOM列表视图 - 只读API，支持排序"""
    queryset = Bom.objects.all().order_by('-created_at')
    serializer_class = BomSerializer
    permission_classes = [IsAuthenticated]
    ordering_fields = ['created_at', 'updated_at', 'style_code', 'product_name']
    ordering = ['-created_at']
