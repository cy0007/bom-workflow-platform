from django.urls import path
from . import views

urlpatterns = [
    path('boms/', views.BomListView.as_view(), name='bom-list'),
    path('boms/<str:style_code>/', views.BomDetailView.as_view(), name='bom-detail'),
    
    # 工作流状态变更API端点
    path('boms/<str:style_code>/submit-for-details/', views.SubmitForDetailsView.as_view(), name='submit-for-details'),
    path('boms/<str:style_code>/submit-to-craft/', views.SubmitToCraftView.as_view(), name='submit-to-craft'),
    path('boms/<str:style_code>/approve/', views.ApproveBomView.as_view(), name='approve-bom'),
    path('boms/<str:style_code>/reject/', views.RejectBomView.as_view(), name='reject-bom'),
    path('boms/<str:style_code>/actions/', views.BomActionsView.as_view(), name='bom-actions'),
    
    # 通知API端点（暂时模拟）
    path('notifications/', views.NotificationView.as_view(), name='notifications'),
]
