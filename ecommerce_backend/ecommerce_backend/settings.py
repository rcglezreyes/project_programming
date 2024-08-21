"""
Django settings for ecommerce_backend project.

Generated by 'django-admin startproject' using Django 5.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import environ
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-#7h-b!hkaku(0oorve^#0@bci4d6-iiz=^9hukml#l6inll_s6'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

env = environ.Env(
    DEBUG=(bool, False)
)

# Lee el archivo .env
environ.Env.read_env()

ALLOWED_HOSTS = [
    'localhost', '127.0.0.1', 'host.docker.internal', 'database.system.com'
]


ENVIRONMENT = env('ENVIRONMENT')

DB_NAME = env('DB_NAME_DEV') if ENVIRONMENT == 'DEV' else env('DB_NAME_QA') if ENVIRONMENT == 'QA' else env('DB_NAME_PROD')
DB_USER = env('DB_USER_DEV') if ENVIRONMENT == 'DEV' else env('DB_USER_QA') if ENVIRONMENT == 'QA' else env('DB_USER_PROD')
DB_PASSWORD = env('DB_PASSWORD_DEV') if ENVIRONMENT == 'DEV' else env('DB_PASSWORD_QA') if ENVIRONMENT == 'QA' else env('DB_PASSWORD_PROD')
DB_HOST = env('DB_HOST_DEV') if ENVIRONMENT == 'DEV' else env('DB_HOST_QA') if ENVIRONMENT == 'QA' else env('DB_HOST_PROD')
DB_PORT = env('DB_PORT')
DB_ENGINE = env('DB_ENGINE')


SESSION_COOKIE_SECURE = False  # False para desarrollo, True para producción

# CORS_ORIGIN_ALLOW_ALL = True  # Permitir todas las solicitudes de origen (para desarrollo)
# o para producción
# CORS_ORIGIN_WHITELIST = [
#     'http://localhost:3000',  # React frontend
# ]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "https://database.system.com",
    "http://127.0.0.1:4200",
    "http://localhost:4200",
    "https://127.0.0.1",
]

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]

CORS_ALLOW_HEADERS = [
    'Authorization',
    'Content-Type',
    'Accept',
    'x-requested-with',
    'accept',
    'origin',
    'user-agent',
    'dnt',
    'cache-control',
    'X-CSRFToken',
    'x-requested-with',
    'x-xsrf-token',
]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'app_ecommerce',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ecommerce_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ecommerce_backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': f'{DB_ENGINE}',
        'NAME': f'{DB_NAME}',
        'USER': f'{DB_USER}',
        'PASSWORD': f'{DB_PASSWORD}',
        'HOST': f'{DB_HOST}',
        'PORT': f'{DB_PORT}',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = ['app_ecommerce.auth_backends.LoginUserBackend', 'django.contrib.auth.backends.ModelBackend']
AUTH_USER_MODEL = 'app_ecommerce.LoginUser'


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'America/New_York'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

print(MEDIA_ROOT)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50 MB en bytes
