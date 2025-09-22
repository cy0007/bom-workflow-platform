from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Bom
from .serializers import BomSerializer

User = get_user_model()


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


class SubmitForDetailsView(APIView):
    """
    版房师傅提交BOM以进行明细填写
    从 PENDING_CRAFT 状态转换为 PENDING_DETAILS 状态
    """
    permission_classes = [AllowAny]  # 临时允许匿名访问，用于测试
    
    def post(self, request, style_code):
        try:
            # 调试信息
            print(f"SubmitForDetailsView: 查找BOM style_code={style_code}")
            all_boms = Bom.objects.all()
            print(f"数据库中的所有BOM: {[b.style_code for b in all_boms]}")
            
            bom = get_object_or_404(Bom, style_code=style_code)
            
            # 模拟用户角色（从请求头或localStorage获取）
            user_role = request.META.get('HTTP_X_USER_ROLE', 'pattern_maker')
            
            # 创建模拟用户对象
            class MockUser:
                def __init__(self, role, username='mock_user'):
                    self.role = role
                    self.username = username
            
            mock_user = MockUser(user_role)
            
            # 执行状态转换
            success = bom.submit_for_details(mock_user)
            
            if success:
                serializer = BomSerializer(bom)
                return Response({
                    'success': True,
                    'message': '状态已更新',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': '无法执行此操作，请检查BOM状态和用户权限'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'操作失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubmitToCraftView(APIView):
    """
    设计助理提交BOM给工艺团队
    从 PENDING_DETAILS 状态转换为 PENDING_CRAFT 状态
    """
    permission_classes = [AllowAny]
    
    def post(self, request, style_code):
        try:
            bom = get_object_or_404(Bom, style_code=style_code)
            
            user_role = request.META.get('HTTP_X_USER_ROLE', 'designer')
            
            class MockUser:
                def __init__(self, role, username='mock_user'):
                    self.role = role
                    self.username = username
            
            mock_user = MockUser(user_role)
            success = bom.submit_to_craft(mock_user)
            
            if success:
                serializer = BomSerializer(bom)
                return Response({
                    'success': True,
                    'message': '状态已更新',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': '无法执行此操作，请检查BOM状态和用户权限'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'操作失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ApproveBomView(APIView):
    """
    BOM管理员批准BOM
    将BOM状态设置为 CONFIRMED
    """
    permission_classes = [AllowAny]
    
    def post(self, request, style_code):
        try:
            bom = get_object_or_404(Bom, style_code=style_code)
            
            user_role = request.META.get('HTTP_X_USER_ROLE', 'admin')
            
            class MockUser:
                def __init__(self, role, username='mock_admin'):
                    self.role = role
                    self.username = username
            
            mock_user = MockUser(user_role)
            success = bom.approve_bom(mock_user)
            
            if success:
                serializer = BomSerializer(bom)
                return Response({
                    'success': True,
                    'message': 'BOM已批准',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': '无法执行此操作，请检查用户权限'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'操作失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RejectBomView(APIView):
    """
    驳回BOM，将状态设置为需要修订
    """
    permission_classes = [AllowAny]
    
    def post(self, request, style_code):
        try:
            bom = get_object_or_404(Bom, style_code=style_code)
            reason = request.data.get('reason', '')
            
            user_role = request.META.get('HTTP_X_USER_ROLE', 'admin')
            
            class MockUser:
                def __init__(self, role, username='mock_admin'):
                    self.role = role
                    self.username = username
            
            mock_user = MockUser(user_role)
            success = bom.reject_bom(mock_user, reason)
            
            if success:
                serializer = BomSerializer(bom)
                return Response({
                    'success': True,
                    'message': 'BOM已驳回',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': '无法执行此操作，请检查用户权限'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'操作失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BomActionsView(APIView):
    """
    获取当前用户对特定BOM可以执行的操作
    """
    permission_classes = [AllowAny]
    
    def get(self, request, style_code):
        try:
            bom = get_object_or_404(Bom, style_code=style_code)
            
            user_role = request.META.get('HTTP_X_USER_ROLE', 'viewer')
            
            class MockUser:
                def __init__(self, role):
                    self.role = role
            
            mock_user = MockUser(user_role)
            actions = bom.get_next_possible_actions(mock_user)
            
            return Response({
                'success': True,
                'style_code': style_code,
                'current_status': bom.status,
                'user_role': user_role,
                'actions': actions
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'获取操作失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationView(APIView):
    """
    通知API - 模拟通知发送和接收
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """发送通知"""
        try:
            # 从请求中获取通知数据
            notification_data = request.data
            
            # 这里可以实现真正的通知逻辑
            # 现在只是模拟返回成功响应
            
            return Response({
                'success': True,
                'message': '通知发送成功',
                'notification_id': f'mock_notification_{hash(str(notification_data))}',
                'data': notification_data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'发送通知失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """获取通知列表"""
        try:
            # 模拟返回通知列表
            notifications = [
                {
                    'id': 'mock_1',
                    'type': 'status_change',
                    'title': 'BOM状态更新',
                    'message': '新的BOM等待填写明细',
                    'isRead': False,
                    'createdAt': '2025-09-21T12:00:00Z'
                },
                {
                    'id': 'mock_2',
                    'type': 'approval',
                    'title': 'BOM已批准',
                    'message': 'BOM TEST001 已被批准',
                    'isRead': True,
                    'createdAt': '2025-09-21T11:00:00Z'
                }
            ]
            
            return Response({
                'success': True,
                'results': notifications,
                'count': len(notifications)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'获取通知失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
