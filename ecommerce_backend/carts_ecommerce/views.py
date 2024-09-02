from django.http import JsonResponse
from django.forms.models import model_to_dict
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Cart
from app_ecommerce.views import validateJWTTokenRequest
from products_ecommerce.models import Product
from customers_ecommerce.models import Customer

import json
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_carts(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        if 'customer_id' in request.GET:
            customer_id = request.GET.get('customer_id')
            list_query = Cart.objects.filter(
                is_active=True, customer__is_active=True, product__is_active=True, customer__id=customer_id
            ).select_related(
                'product__category', 'customer__country'
            ).order_by('-created_at')
        else:
            list_query = Cart.objects.filter(
                is_active=True, customer__is_active=True, product__is_active=True
            ).select_related(
                'product__category', 'customer__country'
            ).order_by('-created_at')

        batch_size = 100 
        lists = []
        for i in range(0, list_query.count(), batch_size):
            batch = list_query[i:i + batch_size]
            for cart in batch:
                cart_data = {
                    'pk': cart.pk,
                    'fields': {
                        'id': cart.id,
                        'quantity': cart.quantity,
                        'created_at': cart.created_at,
                        'updated_at': cart.updated_at,
                        'is_active': cart.is_active,
                        'product': {
                            'pk': cart.product.pk,
                            'fields': {
                                'id': cart.product.id,
                                'name': cart.product.name,
                                'description': cart.product.description,
                                'price': cart.product.price,
                                'stock': cart.product.stock,
                                'available': cart.product.available,
                                'image': cart.product.image,
                                'category': {
                                    'pk': cart.product.category.pk,
                                    'fields': {
                                        'id': cart.product.category.id,
                                        'name': cart.product.category.name,
                                        'sizes': cart.product.category.sizes,
                                        'types': cart.product.category.types
                                    }
                                }
                            }
                        },
                        'customer': {
                            'pk': cart.customer.pk,
                            'fields': {
                                'id': cart.customer.id,
                                'first_name': cart.customer.first_name,
                                'last_name': cart.customer.last_name,
                                'email': cart.customer.email,
                                'country': {
                                    'pk': cart.customer.country.pk,
                                    'fields': {
                                        'id': cart.customer.country.id,
                                        'name': cart.customer.country.name
                                    }
                                },
                                'city': cart.customer.city,
                                'address': cart.customer.address,
                                'postal_code': cart.customer.postal_code,
                                'phone': cart.customer.phone
                            }
                        },
                    }
                }
                lists.append(cart_data)

        return JsonResponse({'data': lists}, safe=False)
    
    return JsonResponse({'error': 'Invalid token'}, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_cart(request):
    valid_token = validateJWTTokenRequest(request)
    is_edit = False
    if valid_token:
        data = json.loads(request.body)
        if 'customer' not in data:
            return JsonResponse({'error': 'Customer not provided'}, status=400)
        customer = Customer.objects.filter(pk=data['customer']).first()
        if not customer:
            return JsonResponse({'error': 'Invalid customer'}, status=400)
        if 'product' not in data:
            return JsonResponse({'error': 'Product not provided'}, status=400)
        product = Product.objects.filter(pk=data['product']).first()
        if not product:
            return JsonResponse({'error': 'Invalid product'}, status=400)
        if 'quantity' not in data:
            return JsonResponse({'error': 'Quantity not provided'}, status=400)
        quantity = data['quantity']
        if quantity < 1:
            return JsonResponse({'error': 'Invalid quantity'}, status=400)
        if 'id' in data:
            is_edit = True
            cart = Cart.objects.filter(id=data['id']).first()
            if not cart:
                return JsonResponse({'error': 'Invalid cart'}, status=400)
            cart.quantity = quantity
            cart.size = data.get('size', '')
            cart.save()
            response = fullCart(cart)
        else:
            cart = Cart.objects.create(customer=customer, product=product, quantity=quantity, size=data.get('size', ''))
        data = model_to_dict(cart) if not is_edit else response
        return JsonResponse({'data': data}, safe=False, status=200)
    return JsonResponse({'error': 'Invalid token or invalid registration'}, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])  
@transaction.atomic
def delete_cart(request):
    try:
        data = json.loads(request.body)
        cart_id = data.get('id')
        
        if not cart_id:
            return JsonResponse({'error': 'Cart ID not provided'}, status=400)
        
        cart = Cart.objects.filter(id=cart_id, is_active=True).first()
        
        if not cart:
            return JsonResponse({'error': 'Cart not found or already inactive'}, status=404)
        
        cart.is_active = False
        cart.save()
        
        return JsonResponse({'message': 'Cart deactivated successfully'}, status=200)
    
    except Exception as e:
        logger.error(f"Error deactivating cart: {str(e)}")
        return JsonResponse({'error': 'An error occurred while deactivating the cart'}, status=500)


def fullCart(cart):
    cart_data = {
        'pk': cart.pk,
        'fields': {
            'id': cart.id,
            'quantity': cart.quantity,
            'created_at': cart.created_at,
            'updated_at': cart.updated_at,
            'is_active': cart.is_active,
            'product': {
                'pk': cart.product.pk,
                'fields': {
                    'id': cart.product.id,
                    'name': cart.product.name,
                    'description': cart.product.description,
                    'price': cart.product.price,
                    'stock': cart.product.stock,
                    'available': cart.product.available,
                    'image': cart.product.image,
                    'category': {
                        'pk': cart.product.category.pk,
                        'fields': {
                            'id': cart.product.category.id,
                            'name': cart.product.category.name,
                            'sizes': cart.product.category.sizes,
                            'types': cart.product.category.types
                        }
                    }
                }
            },
            'customer': {
                'pk': cart.customer.pk,
                'fields': {
                    'id': cart.customer.id,
                    'first_name': cart.customer.first_name,
                    'last_name': cart.customer.last_name,
                    'email': cart.customer.email,
                    'country': {
                        'pk': cart.customer.country.pk,
                        'fields': {
                            'id': cart.customer.country.id,
                            'name': cart.customer.country.name
                        }
                    },
                    'city': cart.customer.city,
                    'address': cart.customer.address,
                    'postal_code': cart.customer.postal_code,
                    'phone': cart.customer.phone
                }
            },
        }
    }
    return cart_data


