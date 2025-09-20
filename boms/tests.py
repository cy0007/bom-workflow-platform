from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, Bom


class BomAPITests(APITestCase):
    def test_can_list_boms(self):
        """
        确保未经认证的用户无法查看BOM列表，而认证用户可以。
        """
        # 准备数据
        user = User.objects.create_user(username='testuser', password='password')
        Bom.objects.create(
            style_code='TEST001', 
            product_name='测试产品',
            season='SPRING',
            year=2025,
            wave='第一波',
            category='TOP',
            dev_colors='黑色/白色',
            created_by=user
        )
        
        url = reverse('bom-list')  # 这个URL name现在还不存在

        # 1. 未认证的请求应被拒绝
        response_unauthenticated = self.client.get(url, format='json')
        self.assertEqual(response_unauthenticated.status_code, status.HTTP_403_FORBIDDEN)
        
        # 2. 认证后的请求应成功
        self.client.login(username='testuser', password='password')
        response_authenticated = self.client.get(url, format='json')
        self.assertEqual(response_authenticated.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_authenticated.data), 1)
        self.assertEqual(response_authenticated.data[0]['style_code'], 'TEST001')
