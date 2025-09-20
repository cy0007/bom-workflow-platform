from django.urls import path
from . import views

urlpatterns = [
    path('boms/', views.BomListView.as_view(), name='bom-list'),
    path('boms/<str:style_code>/', views.BomDetailView.as_view(), name='bom-detail'),
]
