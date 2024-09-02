from django.db import models
from users_ecommerce.models import LoginUser
from app_ecommerce.models import Country

class Customer(models.Model):
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.ForeignKey(Country, related_name='customers', on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(LoginUser, related_name='customer', on_delete=models.CASCADE, null=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f'{self.first_name} {self.last_name}'
