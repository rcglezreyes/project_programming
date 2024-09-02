import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', '_ecommerce_backend.settings')
django.setup()

from django.core.management import call_command
from users_ecommerce.models import LoginUser
from products_ecommerce.models import Category
from app_ecommerce.models import Country

def create_superuser():
    username = os.getenv('DJANGO_SUPERUSER_USERNAME')
    email = os.getenv('DJANGO_SUPERUSER_EMAIL')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

    if not LoginUser.objects.filter(username=username).exists():
        print("Creating superuser...")
        call_command('createsuperuser', '--noinput', '--username', username)
        user = LoginUser.objects.get(username=username)
        user.set_password(password)
        user.email = email
        user.save()
        print("Superuser created!")

def create_loginuser():
    username = os.getenv('LOGINUSER_USERNAME')
    email = os.getenv('LOGINUSER_EMAIL')
    password = os.getenv('LOGINUSER_PASSWORD')

    if not LoginUser.objects.filter(username=username).exists():
        print("Creating LoginUser...")
        LoginUser.objects.create_user(username=username, email=email, password=password, is_staff=True)
        print("LoginUser created!")

def load_countries():
    url = "https://restcountries.com/v3.1/all"
    response = requests.get(url)

    if response.status_code == 200:
        countries_data = response.json()

        for country_data in countries_data:
            name = country_data.get('name', {}).get('common')
            official_name = country_data.get('name', {}).get('official')
            alpha2_code = country_data.get('cca2')
            alpha3_code = country_data.get('cca3')
            capital = country_data.get('capital', [None])[0]
            region = country_data.get('region')
            subregion = country_data.get('subregion')
            population = country_data.get('population')
            area = country_data.get('area')
            timezones = country_data.get('timezones')
            borders = country_data.get('borders')
            currencies = country_data.get('currencies')
            languages = country_data.get('languages')
            flag = country_data.get('flags', {}).get('png')

            # Solo guardar si el nombre no existe
            if not Country.objects.filter(name=name).exists():
                Country.objects.create(
                    name=name,
                    official_name=official_name,
                    alpha2_code=alpha2_code,
                    alpha3_code=alpha3_code,
                    capital=capital,
                    region=region,
                    subregion=subregion,
                    population=population,
                    area=area,
                    timezones=timezones,
                    borders=borders,
                    currencies=currencies,
                    languages=languages,
                    flag=flag,
                )
    else:
        print(f"Failed to fetch data: {response.status_code}")

def load_categories():
    categories = [
        {
            'name': 'Electronics',
            'types': [
                'Smartphones',
                'Laptops',
                'Tablets',
                'Headphones',
                'Smartwatches',
            ],
            'sizes': [
                'Small',
                'Medium',
                'Large'
            ]
        },
        {
            'name': 'Home',
            'types': [
                'Furniture',
                'Appliances',
                'Kitchen',
                'Bedroom',
                'Bathroom',
            ],
            'sizes': [
                'Small',
                'Medium',
                'Large'
            ]
        },
        {
            'name': 'Clothing',
            'types': [
                'T-Shirts',
                'Pants',
                'Dresses',
                'Sweaters',
                'Jackets',
            ],
            'sizes': [
                'XS',
                'S',
                'M',
                'L',
                'XL',
            ]
        },
        {
            'name': 'Shoes',
            'types': [
                'Sneakers',
                'Boots',
                'Sandals',
                'Flats',
                'Heels',
            ],
            'sizes': [
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
            ]
        },
        {
            'name': 'Books',
            'types': [
                'Fiction',
                'Non-Fiction',
                'Mystery',
                'Romance',
                'Thriller',
            ],
            'sizes': []
        },
        {
            'name': 'Toys',
            'types': [
                'Action Figures',
                'Dolls',
                'Puzzles',
                'Board Games',
                'Stuffed Animals',
            ],
            'sizes': []
        },
        {
            'name': 'Furniture',
            'types': [
                'Living Room',
                'Bedroom',
                'Dining Room',
                'Office',
                'Outdoor',
            ],
            'sizes': []
        },
        {
            'name': 'Food',
            'types': [
                'Fruits',
                'Vegetables',
                'Meat',
                'Fish',
                'Dairy',
            ],
            'sizes': []
        },
        {
            'name': 'Sports',
            'types': [
                'Soccer',
                'Basketball',
                'Baseball',
                'Football',
                'Tennis',
            ],
            'sizes': []
        },
        {
            'name': 'Beauty',
            'types': [
                'Skincare',
                'Makeup',
                'Haircare',
                'Fragrance',
                'Bath & Body',
            ],
            'sizes': []
        },
        {
            'name': 'Health',
            'types': [
                'Vitamins',
                'Supplements',
                'Protein',
                'Weight Loss',
                'Dental',
            ],
            'sizes': []
        },
    ]

    for category in categories:
        if not Category.objects.filter(name=category['name']).exists():
            Category.objects.create(
                name=category['name'],
                types=category['types'],
                sizes=category['sizes']
            )
            
            

if __name__ == "__main__":
    create_superuser()
    create_loginuser()
    load_countries()
    load_categories()

