from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, Bom


class BomAPITests(APITestCase):
    def setUp(self):
        """测试数据准备"""
        self.user = User.objects.create_user(username='testuser', password='password')
        self.bom = Bom.objects.create(
            style_code='TEST001', 
            product_name='测试产品',
            season='SPRING',
            year=2025,
            wave='第一波',
            category='TOP',
            dev_colors='黑色/白色',
            created_by=self.user
        )

    def test_can_list_boms(self):
        """
        确保未经认证的用户无法查看BOM列表，而认证用户可以。
        """
        url = reverse('bom-list')

        # 1. 未认证的请求应被拒绝
        response_unauthenticated = self.client.get(url, format='json')
        self.assertEqual(response_unauthenticated.status_code, status.HTTP_403_FORBIDDEN)
        
        # 2. 认证后的请求应成功
        self.client.login(username='testuser', password='password')
        response_authenticated = self.client.get(url, format='json')
        self.assertEqual(response_authenticated.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_authenticated.data), 1)
        self.assertEqual(response_authenticated.data[0]['style_code'], 'TEST001')

    def test_can_retrieve_bom_detail(self):
        """
        确保认证用户可以获取单个BOM的详细信息。
        """
        url = reverse('bom-detail', kwargs={'style_code': self.bom.style_code})

        self.client.login(username='testuser', password='password')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['product_name'], '测试产品')

    def test_can_update_bom_detail(self):
        """
        确保有权限的用户可以更新BOM的某些字段。
        """
        url = reverse('bom-detail', kwargs={'style_code': self.bom.style_code})
        update_data = {'product_name': '更新后的产品名称', 'status': 'PENDING_CRAFT'}

        self.client.login(username='testuser', password='password')
        response = self.client.patch(url, update_data, format='json')
        
        # 验证返回状态和数据
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['product_name'], '更新后的产品名称')

        # 验证数据库中的数据是否真的被更新
        self.bom.refresh_from_db()
        self.assertEqual(self.bom.product_name, '更新后的产品名称')
