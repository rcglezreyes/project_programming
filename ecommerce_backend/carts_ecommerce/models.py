from django.db import models
from customers_ecommerce.models import Customer
from products_ecommerce.models import Product

class Cart(models.Model):
    id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, related_name='cart', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='cart', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'Cart {self.id}'
