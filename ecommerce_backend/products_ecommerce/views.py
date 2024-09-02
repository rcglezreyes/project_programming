from django.http import JsonResponse
from django.core import serializers
from django.forms.models import model_to_dict
from django.db import transaction
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product
from app_ecommerce.views import validateJWTTokenRequest
import json
import logging
import traceback
import os



logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
