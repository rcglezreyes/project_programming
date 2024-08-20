from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.core import serializers
from django.db.models import Q
from django.forms.models import model_to_dict
from django.db import transaction
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from app_ecommerce.models import LoginUser, Country, Customer, Category, Product
import json
import logging
import traceback


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


#############################################
# Authenticated views
#############################################

#############################################
# 1. Login view
#############################################

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  
            username = data.get('username')  
            password = data.get('password') 
            if not username or not password:
                return JsonResponse({'error': 'Username and password required', 'description': 'Username and password required'}, status=400)
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                if not user.is_active:
                    return JsonResponse({'error': 'Invalid credentials', 'description' : 'Username does not exist'}, status=400)
                logger.info(f'User {username} logged in')
                return JsonResponse({
                    'status': 'success', 
                    'is_staff': 'admin' if user.is_staff else 'user', 
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }, status=200)
            login_user = LoginUser.objects.filter(username=username).first()
            if login_user:
                return JsonResponse({'error': 'Invalid credentials', 'description' : 'Incorrect Password'}, status=400)
            else:
                return JsonResponse({'error': 'Invalid credentials', 'description' : 'Username does not exist'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON', 'description': 'Request is not in a valid format'}, status=400)
    return JsonResponse({'error': 'Method not allowed', 'description': 'Method not allowed'}, status=405)


#############################################
# 2. Logout view
#############################################


@csrf_exempt
def logout_view(request):
    if request.method == 'GET':
        username = request.GET.get('username')
        logout(request) 
        return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# ***************************************** #

#############################################
# Lists views
#############################################

#############################################
# 1. List Countries
#############################################

def list_countries(request):
    list_query = Country.objects.filter(is_active=True).order_by('name')
    batch_size = 100 
    lists = []
    for i in range(0, list_query.count(), batch_size):
        batch = list_query[i:i + batch_size]
        lists.extend(batch) 
    items_data = serializers.serialize('json', lists)
    return JsonResponse({'data': items_data}, safe=False)

#############################################
# 2. List Users
#############################################

@api_view(['GET'])
@permission_classes([AllowAny])
def list_users(request):
    valid_token = validateJWTTokenRequest(request)
    email = request.GET.get('email', None)
    username = request.GET.get('username', None)
    if valid_token or email or username:
        if email:
            list_query = LoginUser.objects.filter(email=email).order_by('username')
        elif username:
            list_query = LoginUser.objects.filter(username=username).order_by('username')
        elif valid_token:
            list_query = LoginUser.objects.filter(is_active=True).order_by('username')
        batch_size = 100 
        lists = []
        for i in range(0, list_query.count(), batch_size):
            batch = list_query[i:i + batch_size]
            lists.extend(batch) 
        items_data = serializers.serialize('json', lists)
        return JsonResponse({'data': items_data}, safe=False)
    return JsonResponse({'error': 'Invalid token'}, status=401)


#############################################
# 3. List Customers
#############################################

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

#############################################
# 4. List Categories
#############################################

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_categories(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        list_query = Category.objects.filter(is_active=True).order_by('name')
        batch_size = 100 
        lists = []
        for i in range(0, list_query.count(), batch_size):
            batch = list_query[i:i + batch_size]
            lists.extend(batch) 
        items_data = serializers.serialize('json', lists)
        return JsonResponse({'data': items_data}, safe=False)
    return JsonResponse({'error': 'Invalid token'}, status=401)

#############################################
# 4. List Categories
#############################################

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_products(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        list_query = Product.objects.filter(is_active=True).order_by('name')
        batch_size = 100 
        lists = []
        for i in range(0, list_query.count(), batch_size):
            batch = list_query[i:i + batch_size]
            lists.extend(batch) 
        items_data = serializers.serialize('json', lists)
        return JsonResponse({'data': items_data}, safe=False)
    return JsonResponse({'error': 'Invalid token'}, status=401)

# ***************************************** #
    
#############################################
# Manage views
#############################################

#############################################
# 1. Manage Customer
#############################################

@api_view(['POST'])
@permission_classes([AllowAny])
def manage_customer(request):
    valid_token = validateJWTTokenRequest(request)
    data = json.loads(request.body)
    is_registration = data.get('is_registration', False)
    if valid_token or is_registration:
        try:
            country = Country.objects.filter(pk=data['country']).first()
            if not country:
                return JsonResponse({'error': 'Invalid country'}, status=400)
        except:
            logger.error(traceback.format_exc())
            return JsonResponse({'error': 'Invalid country'}, status=400)

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
                user.set_password(data['password'] if 'password' in data else user.username)
                user.email = data['email']
                user.first_name = data['first_name']
                user.last_name = data['last_name']
                user.save()
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({'error': 'Invalid data for user', 'details': str(e)}, status=400)

        try:
            customer = Customer.objects.filter(id=data.get('id', None)).first()
            if not customer:
                customer = Customer.objects.create()
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

# ***************************************** #

#############################################
# Delete views
#############################################

#############################################
# 1. Delete customer
#############################################

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

# ***************************************** #

#############################################
# Extras
#############################################

#############################################
# 1. Validate Token
#############################################

def validateJWTTokenRequest(request):
    auth_header = request.headers.get('Authorization')
    if auth_header:
        token = auth_header.split(' ')[1]
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return True if user else False
        except (InvalidToken, TokenError) as e:
            return False
    else:
        return False    

