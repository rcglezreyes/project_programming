from django.http import JsonResponse
from django.forms.models import model_to_dict
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from app_ecommerce.views import validateJWTTokenRequest, send_orders_confirmation_email
from customers_ecommerce.models import Customer
from products_ecommerce.models import Product
from carts_ecommerce.models import Cart
from .models import Order, OrderItem

import json



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_orders(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        if 'customer_id' in request.GET:
            customer_id = request.GET.get('customer_id')
            list_orders_query = Order.objects.filter(
                customer__is_active=True, customer__id=customer_id, is_active=True
            ).select_related('customer').order_by('-created_at')
        else:
            list_orders_query = Order.objects.filter(
                customer__is_active=True, is_active=True
            ).select_related('customer').order_by('-created_at')    
        list_orders_items_query = []
        for order in list_orders_query:
            orders_items_query = OrderItem.objects.filter(order=order).select_related(
                'product', 'order', 'order__customer', 'product__category', 'order__customer__country'
            ).order_by('-order__created_at')
            list_orders_items_query.extend(orders_items_query)
        batch_size = 100
        lists = []
        
        for i in range(0, len(list_orders_items_query), batch_size):
            batch = list_orders_items_query[i:i + batch_size]
            for order_item in batch:
                order_data = { 
                        'pk': order_item.pk,
                        'fields': {
                            'id': order_item.id,
                            'order': {
                                'pk': order_item.order.pk,
                                'fields': {
                                    'id': order_item.order.id,
                                    'total': order_item.order.total,
                                    'created_at': order_item.order.created_at,
                                    'updated_at': order_item.order.updated_at,
                                    'is_active': order_item.order.is_active,
                                    'customer': {
                                        'pk': order_item.order.customer.pk,
                                        'fields': {
                                            'id': order_item.order.customer.id,
                                            'first_name': order_item.order.customer.first_name,
                                            'last_name': order_item.order.customer.last_name,
                                            'email': order_item.order.customer.email,
                                            'country': {
                                                'pk': order_item.order.customer.country.pk,
                                                'fields': {
                                                    'id': order_item.order.customer.country.id,
                                                    'name': order_item.order.customer.country.name
                                                }
                                            },
                                            'city': order_item.order.customer.city,
                                            'address': order_item.order.customer.address,
                                            'postal_code': order_item.order.customer.postal_code,
                                            'phone': order_item.order.customer.phone
                                        }
                                    }
                                }
                            },
                            'product': {
                                'pk': order_item.product.pk,
                                'fields': {
                                    'id': order_item.product.id,
                                    'name': order_item.product.name,
                                    'description': order_item.product.description,
                                    'price': order_item.product.price,
                                    'stock': order_item.product.stock,
                                    'available': order_item.product.available,
                                    'image': order_item.product.image,
                                    'category': {
                                        'pk': order_item.product.category.pk,
                                        'fields': {
                                            'id': order_item.product.category.id,
                                            'name': order_item.product.category.name,
                                            'sizes': order_item.product.category.sizes,
                                            'types': order_item.product.category.types
                                        }
                                    }
                                }
                            },
                            'quantity': order_item.quantity,
                            'size': order_item.size,
                            'is_active': order_item.is_active
                        }     
                    }
                lists.append(order_data) 
        return JsonResponse({'data': lists}, safe=False)
    return JsonResponse({'error': 'Invalid token'}, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_order(request):
    valid_token = validateJWTTokenRequest(request)
    is_edit = False
    if valid_token:
        data = json.loads(request.body)
        if 'customer' not in data:
            return JsonResponse({'error': 'Customer not provided'}, status=400)
        customer = Customer.objects.filter(pk=data['customer']).first()
        if not customer:
            return JsonResponse({'error': 'Invalid customer'}, status=400)
        if 'listOrderItem' not in data:
            return JsonResponse({'error': 'List of orders not provided'}, status=400)
        order = Order.objects.create(
                customer=customer, 
                total=data.get('total', 0)
            )
        order.save()
        list_orders_items_query = []
        for item in data['listOrderItem']:
            product = Product.objects.filter(pk=item['product']).first()
            if not product:
                return JsonResponse({'error': 'Invalid product'}, status=400)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.get('quantity', 1),
                price=product.price,
                size=item.get('size', '')
            )
            cart = Cart.objects.filter(id=item.get('idCart')).first()
            cart.is_active = False
            cart.save()
            list_orders_items_query.append({
                'product': model_to_dict(product),
                'quantity': item.get('quantity', 1),
            })
            new_quantity = product.stock - item.get('quantity', 1) 
            product.stock = new_quantity if new_quantity >= 0 else 0
            product.save()
        config_info = {
            'email': data.get('email', ''),
            'full_name': data.get('full_name', ''),
            'confirmation_number': order.confirmation_number,
        } 
        send_orders_confirmation_email(config_info, list_orders_items_query)
        return JsonResponse({'data': data}, safe=False, status=200)
    return JsonResponse({'error': 'Invalid token or invalid registration'}, status=401)