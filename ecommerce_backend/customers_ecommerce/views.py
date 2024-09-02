from django.http import JsonResponse
from django.core import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.forms.models import model_to_dict
from django.db.models import Q
from django.db import transaction
from .models import Customer
from app_ecommerce.views import validateJWTTokenRequest
from users_ecommerce.models import LoginUser
from app_ecommerce.models import Country

import json
import logging
import traceback

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)



@api_view(['GET'])
@permission_classes([AllowAny])
def list_customers(request):
    valid_token = validateJWTTokenRequest(request)
    email = request.GET.get('email', None)
    if valid_token or email:
        if email:
            list_query = Customer.objects.filter(email=email).order_by('first_name')
        elif valid_token:
            list_query = Customer.objects.filter(is_active=True).order_by('first_name')
        batch_size = 100 
        lists = []
        for i in range(0, list_query.count(), batch_size):
            batch = list_query[i:i + batch_size]
            lists.extend(batch) 
        items_data = serializers.serialize('json', lists)
        return JsonResponse({'data': items_data}, safe=False)
    return JsonResponse({'error': 'Invalid token'}, status=401)


@api_view(['POST'])
@permission_classes([AllowAny])
def manage_customer(request):
    valid_token = validateJWTTokenRequest(request)
    data = json.loads(request.body)
    is_registration = data.get('is_registration', False)
    is_profile_edit = data.get('is_profile_edit', False)
    if valid_token or is_registration or is_profile_edit:
        try:
            user = LoginUser.objects.filter(Q(username=data.get('username', '')) | Q(email=data['email'])).first()
            
            if not user:
                username = data['username'] if 'username' in data else data['email'].split('@')[0]
                password = data['password'] if 'password' in data else username
                user = LoginUser.objects.create(
                    username=username,
                    email=data['email'],
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    is_staff=False
                )
                user.set_password(password) 
                user.save()
            else:
                user.username = data['username'] if 'username' in data else data['email'].split('@')[0]
                password = None
                if is_profile_edit:
                    if 'new_password' in data:
                        password = data['new_password']
                elif 'password' in data:
                    password = data['password']
                if password:
                    user.set_password(password)
                user.email = data['email']
                user.first_name = data['first_name']
                user.last_name = data['last_name']
                user.save()
                if user.is_staff:
                    return JsonResponse({'data': model_to_dict(user)}, status=400)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({'error': 'Invalid data for user', 'details': str(e)}, status=400)

        try:
            customer = Customer.objects.filter(id=data.get('id', None)).first()
            if not customer:
                customer = Customer.objects.create()
            try:
                country = Country.objects.filter(pk=data['country']).first()
                if not country:
                    return JsonResponse({'error': 'Invalid country'}, status=400)
            except:
                logger.error(traceback.format_exc())
                return JsonResponse({'error': 'Invalid country'}, status=400)
            customer.first_name = data['first_name']
            customer.last_name = data['last_name']
            customer.email = data['email']
            customer.country = country
            customer.city = data['city']
            customer.address = data['address']
            customer.postal_code = data['postal_code']
            customer.phone = data['phone']
            customer.user = user
            customer.save()
        except:
            logger.error(traceback.format_exc())
            return JsonResponse({'error': 'Invalid data for customer'}, status=400)

        return JsonResponse({'data': model_to_dict(customer)}, safe=False, status=200)
    return JsonResponse({'error': 'Invalid token or invalid registration'}, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ajusta los permisos según tu lógica
@transaction.atomic
def delete_customer(request):
    try:
        data = json.loads(request.body)
        customer_id = data.get('id')
        
        if not customer_id:
            return JsonResponse({'error': 'Customer ID not provided'}, status=400)
        
        customer = Customer.objects.filter(id=customer_id, is_active=True).first()
        
        if not customer:
            return JsonResponse({'error': 'Customer not found or already inactive'}, status=404)
        
        customer.is_active = False
        customer.save()
        user = customer.user
        user.is_active = False
        user.save()
        
        return JsonResponse({'message': 'Customer deactivated successfully'}, status=200)
    
    except Exception as e:
        logger.error(f"Error deactivating customer: {str(e)}")
        return JsonResponse({'error': 'An error occurred while deactivating the customer'}, status=500)

