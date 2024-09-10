from functools import reduce
from email.mime.image import MIMEImage
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.core import serializers
from django.forms.models import model_to_dict
from django.core.mail import send_mail, EmailMultiAlternatives, EmailMessage
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from app_ecommerce.models import Country
from customers_ecommerce.models import Customer
from users_ecommerce.models import LoginUser
import json
import logging
import os



logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
                user.number_of_logins += 1
                user.save()
                logger.info(f'User {username} logged in')
                customer = Customer.objects.filter(user=user).first()
                customer = model_to_dict(customer) if customer else None
                return JsonResponse({
                    'status': 'success', 
                    'is_staff': 'admin' if user.is_staff else 'user', 
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'number_of_logins': user.number_of_logins,
                    'customer': customer
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


#############################################
# 3. Session Data
#############################################

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_session_data(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        try:
            username = request.GET.get('username')  
            if not username:
                return JsonResponse({'error': 'Username required', 'description': 'Username required'}, status=400)
            user = LoginUser.objects.filter(username=username).first()
            if user is not None:
                customer = Customer.objects.filter(user=user).first()
                customer = model_to_dict(customer) if customer else None
                return JsonResponse({
                    'status': 'success', 
                    'is_staff': 'admin' if user.is_staff else 'user', 
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'number_of_logins': user.number_of_logins,
                    'customer': customer if customer else model_to_dict(user)
                }, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON', 'description': 'Request is not in a valid format'}, status=400)
    return JsonResponse({'error': 'Invalid token'}, status=401)


def list_countries(request):
    list_query = Country.objects.filter(is_active=True).order_by('name')
    batch_size = 100 
    lists = []
    for i in range(0, list_query.count(), batch_size):
        batch = list_query[i:i + batch_size]
        lists.extend(batch) 
    items_data = serializers.serialize('json', lists)
    return JsonResponse({'data': items_data}, safe=False)


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

def send_orders_confirmation_email(config_info, list_orders_items_query):
    total = sum(order['product']['price'] * order['quantity'] for order in list_orders_items_query)
    
    products = [
        {
            'name': order['product']['name'],
            'price': order['product']['price'],
            'quantity': order['quantity'],
            'amount': order['product']['price'] * order['quantity'],
            'image_path': os.path.join(settings.BASE_DIR, order['product']['image']).strip('/'),
            'image_cid': f"{order['product']['id']}_image"
        }
        for order in list_orders_items_query
    ]
    
    logo_path = os.path.join(settings.BASE_DIR, '/media/logo.png').strip('/')
    logo_cid = 'logo_image'
    
    context = {
        'full_name': config_info['full_name'],
        'total': total,
        'products': products,
        'logo_cid': logo_cid,
        'confirmation_number': config_info['confirmation_number']
    }
    
    html_content = render_to_string('email_order_template.html', context)
    text_content = strip_tags(html_content)
    
    email_message = EmailMultiAlternatives(
        subject=f"Details from your order # {config_info['confirmation_number']}",
        body=text_content,
        from_email=f"ECommerce Shopping ReyesFullStackDev <{settings.EMAIL_HOST_USER}>",
        to=[config_info['email']]
    )
    email_message.attach_alternative(html_content, "text/html")
    
    
    
    with open(logo_path, 'rb') as img:
        logo = MIMEImage(img.read())
        logo.add_header('Content-ID', f'<{logo_cid}>')
        logo.add_header('Content-Disposition', 'inline', filename=os.path.basename(logo_path))
        email_message.attach(logo)
    
    for product in products:
        image_path = product['image_path']
        file_extension = os.path.splitext(image_path)[1].lower()  
        mime_type = settings.MIME_TYPES.get(file_extension, 'application/octet-stream')
        
        with open(image_path, 'rb') as img:
            product_image = MIMEImage(img.read(), _subtype=mime_type.split('/')[1])
            product_image.add_header('Content-ID', f'<{product["image_cid"]}>')
            product_image.add_header('Content-Disposition', 'inline', filename=os.path.basename(image_path))
            email_message.attach(product_image)
    
    email_message.send()
    

#############################################
# 4. Data Charts Views
#############################################