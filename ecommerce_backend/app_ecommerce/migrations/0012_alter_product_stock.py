# Generated by Django 5.1 on 2024-08-21 04:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_ecommerce', '0011_alter_product_price'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
