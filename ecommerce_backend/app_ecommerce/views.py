from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.core import serializers
from django.db.models import Q
from django.forms.models import model_to_dict
from django.db import transaction
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from app_ecommerce.models import LoginUser, Country, Customer, Category, Product, Cart
import json
import logging
import traceback
import os


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
                customer = Customer.objects.filter(user=user).first() if not user.is_staff else None
                return JsonResponse({
                    'status': 'success', 
                    'is_staff': 'admin' if user.is_staff else 'user', 
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'customer': model_to_dict(customer) if customer else None
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
# 5. List Products
#############################################

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_products(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        list_query = Product.objects.filter(is_active=True).select_related('category').order_by('name')

        batch_size = 100 
        lists = []
        for i in range(0, list_query.count(), batch_size):
            batch = list_query[i:i + batch_size]
            for product in batch:
                product_data = {
                    'pk': product.pk,
                    'fields': {
                        'id': product.id,
                        'name': product.name,
                        'description': product.description,
                        'price': product.price,
                        'stock': product.stock,
                        'available': product.available,
                        'image': product.image,
                        'category': {
                            'pk': product.category.pk,
                            'fields': {
                                'id': product.category.id,
                                'name': product.category.name,
                                'sizes': product.category.sizes,
                                'types': product.category.types
                            }
                        }
                    }
                }
                lists.append(product_data)

        return JsonResponse({'data': lists}, safe=False)
    
    return JsonResponse({'error': 'Invalid token'}, status=401)


#############################################
# 6. List Carts
#############################################

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
                                'product': cart.product.name,
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

#############################################
# 2. Manage Product
#############################################

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_product(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        try:
            data = json.loads(request.body)
            logger.info(f'Data: {data}')
            
            if 'category' not in data:
                return JsonResponse({'error': 'Category not provided'}, status=400)
            
            req_category = data.get('category') 
            
            req_category = Category.objects.filter(pk=req_category.get('pk')).first().pk \
                           if isinstance(req_category, dict) else req_category
            
            category = Category.objects.filter(pk=req_category).first()
            if not category:
                return JsonResponse({'error': 'Invalid category'}, status=400)
            
            required_fields = ['name', 'price', 'stock', 'available', 'image']
            for field in required_fields:
                if field not in data or data[field] in [None, '']:
                    return JsonResponse({'error': f'Missing or invalid field: {field}'}, status=400)
            
            product = None
            if 'id' in data:
                product = Product.objects.filter(id=data['id']).first()
            
            if not product:
                product = Product.objects.create()
            
            product.name = data['name']
            product.description = data.get('description', '') 
            product.price = data['price']
            product.category = category
            product.stock = data['stock']
            product.available = data['available']
            product.image = data['image']
            product.save()

            return JsonResponse({'data': model_to_dict(product)}, safe=False, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({'error': f'Invalid data for product: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid token or invalid registration'}, status=401)


#############################################
# 3. Manage Cart
#############################################

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_cart(request):
    valid_token = validateJWTTokenRequest(request)
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
        cart = Cart.objects.create(customer=customer, product=product, quantity=quantity)
        return JsonResponse({'data': model_to_dict(cart)}, safe=False, status=200)
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
    
    
#############################################
# 2. Delete product
#############################################

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ajusta los permisos según tu lógica
@transaction.atomic
def delete_product(request):
    try:
        data = json.loads(request.body)
        product_id = data.get('id')
        
        if not product_id:
            return JsonResponse({'error': 'Product ID not provided'}, status=400)
        
        product = Product.objects.filter(id=product_id, is_active=True).first()
        
        if not product:
            return JsonResponse({'error': 'Product not found or already inactive'}, status=404)
        
        product.is_active = False
        product.save()
        
        return JsonResponse({'message': 'Product deactivated successfully'}, status=200)
    
    except Exception as e:
        logger.error(f"Error deactivating product: {str(e)}")
        return JsonResponse({'error': 'An error occurred while deactivating the product'}, status=500)

# ***************************************** #

#############################################
# Upload views
#############################################

#############################################
# 1. Upload Image Products
#############################################

@api_view(['POST'])
@permission_classes([IsAuthenticated])  
def upload_image(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)
        file = request.FILES['file']
        logger.info(f'File: {file}')
        if file:
            try:
                file_path = os.path.join(settings.MEDIA_ROOT, file.name)
                with open(file_path, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                image_url = f'/media/{file.name}'
                return JsonResponse({'imageUrl': image_url})
            except Exception as e:
                logger.error(f'File upload failed: {str(e)}')
                return JsonResponse({'error': 'File upload failed'}, status=400)
    return JsonResponse({'error': 'Invalid token'}, status=401)


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

