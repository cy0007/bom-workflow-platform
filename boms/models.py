from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinLengthValidator, MaxValueValidator, MinValueValidator
from decimal import Decimal


class User(AbstractUser):
    """自定义用户模型 - 扩展Django默认用户模型"""
    ROLE_CHOICES = (
        ('designer', '设计助理'),
        ('pattern_maker', '版房师傅'),
        ('admin', '管理员'),
    )
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='designer',
        verbose_name='角色'
    )
    phone = models.CharField(max_length=20, blank=True, verbose_name='电话号码')
    department = models.CharField(max_length=50, blank=True, verbose_name='部门')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'
        db_table = 'bom_user'

    def __str__(self):
        return f"{self.username}({self.get_role_display()})"


class Bom(models.Model):
    """BOM主表模型 - 管理整个BOM的基本信息和状态"""
    STATUS_CHOICES = (
        ('DRAFT', '草稿'),
        ('PENDING_CRAFT', '待填写工艺'),
        ('PENDING_PATTERN', '待版房确认'),
        ('CONFIRMED', '已确认'),
        ('REVISED', '已修订'),
        ('CANCELLED', '已取消'),
    )

    SEASON_CHOICES = (
        ('SPRING', '春季'),
        ('SUMMER', '夏季'),  
        ('AUTUMN', '秋季'),
        ('WINTER', '冬季'),
    )

    CATEGORY_CHOICES = (
        ('TOP', '上衣'),
        ('BOTTOM', '下装'),
        ('DRESS', '连衣裙'),
        ('OUTERWEAR', '外套'),
        ('ACCESSORY', '配饰'),
    )

    # 主键字段
    style_code = models.CharField(
        max_length=50, 
        unique=True, 
        primary_key=True,
        validators=[MinLengthValidator(5)],
        verbose_name='款式编码'
    )
    
    # 基本信息
    product_name = models.CharField(max_length=200, verbose_name='产品名称')
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, verbose_name='季节')
    year = models.PositiveIntegerField(verbose_name='年份')
    wave = models.CharField(max_length=50, verbose_name='波段')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='品类')
    
    # 颜色和价格信息
    dev_colors = models.TextField(verbose_name='开发颜色', help_text='多个颜色用/分隔，如：黑色/白色/红色')
    target_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name='目标价格'
    )
    estimated_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name='预估成本'
    )
    
    # 规格信息
    fabric_composition = models.TextField(blank=True, verbose_name='面料成分')
    fabric_weight = models.CharField(max_length=50, blank=True, verbose_name='面料克重')
    care_instructions = models.TextField(blank=True, verbose_name='洗护说明')
    
    # 状态和流程
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='DRAFT',
        verbose_name='状态'
    )
    version = models.PositiveIntegerField(default=1, verbose_name='版本号')
    
    # 用户关联
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_boms',
        verbose_name='创建人'
    )
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_boms',
        verbose_name='负责人'
    )
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    confirmed_at = models.DateTimeField(null=True, blank=True, verbose_name='确认时间')
    
    # 备注
    notes = models.TextField(blank=True, verbose_name='备注')

    class Meta:
        verbose_name = 'BOM'
        verbose_name_plural = 'BOM列表'
        db_table = 'bom_main'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.style_code} - {self.product_name}"

    @property
    def dev_colors_list(self):
        """将开发颜色文本转换为列表"""
        if not self.dev_colors:
            return []
        return [color.strip() for color in self.dev_colors.split('/')]

    def get_total_cost(self):
        """计算总成本（所有BomDetail的成本之和）"""
        return self.details.aggregate(
            total=models.Sum(
                models.F('unit_price') * models.F('usage_quantity')
            )
        )['total'] or Decimal('0.00')


class BomDetail(models.Model):
    """BOM详情模型 - 管理每个BOM中的物料明细"""
    MATERIAL_CHOICES = (
        ('FABRIC', '面料'),
        ('LINING', '里料'),
        ('INTERLINING', '衬布'),
        ('THREAD', '缝纫线'),
        ('BUTTON', '纽扣'),
        ('ZIPPER', '拉链'),
        ('LABEL', '标签'),
        ('TRIM', '辅料'),
        ('ELASTIC', '松紧带'),
        ('OTHER', '其他'),
    )

    UNIT_CHOICES = (
        ('M', '米'),
        ('KG', '千克'),
        ('PCS', '个'),
        ('PAIR', '对'),
        ('SET', '套'),
        ('ROLL', '卷'),
        ('YARD', '码'),
    )

    # 主键
    id = models.AutoField(primary_key=True)
    
    # 关联BOM
    bom = models.ForeignKey(
        Bom, 
        on_delete=models.CASCADE, 
        related_name='details',
        verbose_name='所属BOM'
    )
    
    # 序号（在BOM中的顺序）
    sequence = models.PositiveIntegerField(verbose_name='序号')
    
    # 物料信息
    material_type = models.CharField(
        max_length=20, 
        choices=MATERIAL_CHOICES,
        verbose_name='物料类型'
    )
    material_name = models.CharField(max_length=200, verbose_name='物料名称')
    material_code = models.CharField(max_length=100, blank=True, verbose_name='物料编码')
    specification = models.TextField(verbose_name='规格描述')
    
    # 供应商信息
    supplier_name = models.CharField(max_length=200, blank=True, verbose_name='供应商')
    supplier_code = models.CharField(max_length=100, blank=True, verbose_name='供应商编码')
    
    # 用量和价格
    usage_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=3,
        validators=[MinValueValidator(0)],
        verbose_name='用量'
    )
    usage_unit = models.CharField(
        max_length=10, 
        choices=UNIT_CHOICES,
        verbose_name='单位'
    )
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=4,
        validators=[MinValueValidator(0)],
        verbose_name='单价'
    )
    
    # 颜色相关
    color_requirement = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name='颜色要求'
    )
    
    # 工艺要求
    craft_requirement = models.TextField(blank=True, verbose_name='工艺要求')
    
    # 备注
    notes = models.TextField(blank=True, verbose_name='备注')
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = 'BOM明细'
        verbose_name_plural = 'BOM明细'
        db_table = 'bom_detail'
        unique_together = ['bom', 'sequence']
        ordering = ['bom', 'sequence']

    def __str__(self):
        return f"{self.bom.style_code} - {self.sequence:02d} - {self.material_name}"

    @property
    def total_cost(self):
        """计算该明细的总成本"""
        return self.usage_quantity * self.unit_price


class SizeSpec(models.Model):
    """尺码规格模型 - 管理每个BOM的尺码规格表"""
    SIZE_CHOICES = (
        ('XXS', 'XXS'),
        ('XS', 'XS'),
        ('S', 'S'),
        ('M', 'M'),
        ('L', 'L'),
        ('XL', 'XL'),
        ('XXL', 'XXL'),
        ('XXXL', 'XXXL'),
    )

    # 主键
    id = models.AutoField(primary_key=True)
    
    # 关联BOM
    bom = models.ForeignKey(
        Bom, 
        on_delete=models.CASCADE, 
        related_name='size_specs',
        verbose_name='所属BOM'
    )
    
    # 尺码
    size = models.CharField(
        max_length=10, 
        choices=SIZE_CHOICES,
        verbose_name='尺码'
    )
    
    # 尺寸规格（JSON格式存储各部位尺寸）
    measurements = models.JSONField(
        default=dict,
        verbose_name='尺寸规格',
        help_text='存储各部位尺寸，如：{"胸围": 108, "肩宽": 45, "袖长": 60}'
    )
    
    # 排列顺序
    sort_order = models.PositiveIntegerField(default=0, verbose_name='排序')
    
    # 是否启用
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '尺码规格'
        verbose_name_plural = '尺码规格'
        db_table = 'bom_size_spec'
        unique_together = ['bom', 'size']
        ordering = ['bom', 'sort_order', 'size']

    def __str__(self):
        return f"{self.bom.style_code} - {self.size}"

    def get_measurement(self, part_name):
        """获取指定部位的尺寸"""
        return self.measurements.get(part_name, 0)
