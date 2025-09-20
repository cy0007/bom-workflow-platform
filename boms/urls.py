from django.urls import path
from . import views

urlpatterns = [
    path('boms/', views.BomListView.as_view(), name='bom-list'),
]
