bind = '0.0.0.0:8000'
workers = 3
threads = 2
timeout = 512
graceful_timeout = 512
keepalive = 5
accesslog = '-'
errorlog = '-'
loglevel = 'info'
wsgi_app = 'ecommerce_backend.wsgi:application'