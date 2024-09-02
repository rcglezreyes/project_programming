from django.db import models
from customers_ecommerce.models import Customer
from products_ecommerce.models import Product
import uuid

class Order(models.Model):
    id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, related_name='orders', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    confirmation_number = models.CharField(
        max_length=32, unique=True
    )
    is_active = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        if not self.confirmation_number:
            self.confirmation_number = self.generate_unique_random_value()
        super(Order, self).save(*args, **kwargs)

    def __str__(self):
        return f'Order {self.id}'
    
    def generate_unique_random_value(self):
        while True:
            unique_value = uuid.uuid4().hex 
            if not Order.objects.filter(confirmation_number=unique_value).exists():
                return unique_value
            
    
class OrderItem(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=50, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.quantity} of {self.product.name}'
    
class Payment(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.OneToOneField(Order, related_name='payment', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    payment_date = models.DateTimeField(auto_now_add=True)
    paid = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'Payment for Order {self.order.id}'
    