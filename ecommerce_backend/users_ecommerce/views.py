from django.http import JsonResponse
from django.core import serializers
from django.db.models import Q
from django.forms.models import model_to_dict 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from users_ecommerce.models import LoginUser
from app_ecommerce.views import validateJWTTokenRequest
import json

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_user(request):
    valid_token = validateJWTTokenRequest(request)
    if valid_token:
        data = json.load(request.body)
        if 'email' in data and 'username' in data and 'password' in data:
            email = data.get('email')
            username = data.get('username')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            is_staff = data.get('is_staff', False)
            password = data.get('password')
            user = LoginUser.objects.filter(Q(email=email) | Q(username=username)).first()
            if user:
                user.email = email
                user.username = username
                user.first_name = first_name if first_name else user.first_name
                user.last_name = last_name if last_name else user.last_name
                user.is_staff = is_staff
            else:
                user = LoginUser.objects.create(
                    email=email, 
                    username=username, 
                    first_name=first_name,
                    last_name=last_name,
                    is_staff=is_staff,
                )
            if password:
                user.set_password(password)
            user.save()    
            return JsonResponse({'data': model_to_dict(user)}, status=201)
        return JsonResponse({'error': 'Invalid data'}, status=400)
    return JsonResponse({'error': 'Invalid token'}, status=401)
