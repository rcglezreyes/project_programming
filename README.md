# Plataforma de E-Commerce

¡Bienvenido a la Plataforma de E-Commerce! Este proyecto está construido de la siguiente manera: 
- Angular, Javascript, Typescript, HTML y CSS para el frontend.
- Django y Python para el backend. 
- La BD esta configurada para PostgreSQL en su version 16.0.
- Utiliza un server Nginx para la seguridad de la red y el uso de SSL.
- Está contenedorizado utilizando Docker y Docker Compose.

## Tabla de Contenidos

- [Instalación](#instalación)
  - [Instalando Docker Compose](#instalando-docker-compose)
    - [Windows](#windows)
    - [macOS](#macos)
    - [Linux](#linux)
- [Ejecutar los Servicios](#ejecutar-los-servicios)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías usadas](#tecnologías-usadas)
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Seguridad](#seguridad)
- [Chatbot](#chatbot)
- [Despliegue en AWS](#despliegue-en-aws)

## Instalación

### Instalando Docker Compose

#### Windows

1. **Instalar Docker Desktop**:
   - Descarga e instala Docker Desktop desde [Docker Hub](https://www.docker.com/products/docker-desktop).
   - Sigue las instrucciones de instalación y asegúrate de que Docker Desktop esté ejecutándose.

2. **Verificar la Instalación**:
   - Abre el Símbolo del sistema (cmd) o PowerShell.
   - Ejecuta el siguiente comando para verificar la instalación:
     ```sh
     docker-compose --version
     ```

#### macOS

1. **Instalar Docker Desktop**:
   - Descarga e instala Docker Desktop desde [Docker Hub](https://www.docker.com/products/docker-desktop).
   - Sigue las instrucciones de instalación y asegúrate de que Docker Desktop esté ejecutándose.

2. **Verificar la Instalación**:
   - Abre la Terminal.
   - Ejecuta el siguiente comando para verificar la instalación:
     ```sh
     docker-compose --version
     ```

#### Linux

1. **Instalar Docker**:
   - Sigue las instrucciones para instalar Docker desde [la documentación oficial de Docker](https://docs.docker.com/engine/install/).

2. **Instalar Docker Compose**:
   - Ejecuta los siguientes comandos para descargar e instalar Docker Compose:
     ```sh
     sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
     sudo chmod +x /usr/local/bin/docker-compose
     ```

3. **Verificar la Instalación**:
   - Ejecuta el siguiente comando para verificar la instalación:
     ```sh
     docker-compose --version
     ```

## Ejecutar los Servicios

Una vez que Docker Compose esté instalado, sigue estos pasos para iniciar los servicios:

1. **Clonar el Repositorio**:
   ```sh
   git clone https://github.com/rcglezreyes/project_programming.git
   cd project_programming
   ```
2. **Ejecución del sistema**:

Para levantar el sistema en ambiente docker solo tiene que ejecutar este comando desde la carpeta de la aplicación:
   ```sh
   docker-compose up -d --build
   ```
Para detener el servicio:
   ```sh
   docker-compose down
   ```
Finalmente accediendo a la URL: ```https://127.0.0.1/``` puede levantar la aplicación en ambiente docker


## Estructura del proyecto

![Estructura](ecommerce_frontend/media/images/estructura.png)

Muestra las carpetas de las 4 imágenes del proyecto:
backend, frontend, nginx y postgres
En el caso de nginx, se deben generar los certificados si se correrá local. Estos son los comandos:
```openssl genpkey -algorithm RSA -out nginx/certificates/DNS/dns_key.pem```

```openssl req -new -key nginx/certificates/DNS/dns_key.pem -x509 -days 365 -out nginx/certificates/DNS/dns_cert.crt```

```openssl pkcs12 -export -out nginx/certificates/DNS/dns_cert.pfx -inkey nginx/certificates/DNS/dns_key.pem -in nginx/certificates/DNS/dns_cert.crt```


```openssl pkcs12 -in nginx/certificates/DNS/dns_cert.pfx -out nginx/certificates/DNS/dns_cert.pem -nodes -clcerts```

```openssl pkcs12 -in nginx/certificates/DNS/dns_cert.pfx -out nginx/certificates/DNS/dns_key.pem -nodes -nocerts```

```openssl pkcs12 -in nginx/certificates/DNS/dns_cert.pfx -out nginx/certificates/DNS/dns_chain.pem -nodes -nokeys -clcerts```

## Tecnologías usadas

Lenguajes de Programación: HTML5, Javascript y Python
Frameworks: Angulas y Django
Estilos: Material UI y CSS
Otras librerías: Sweetalert (Swal)


## Descripción del proyecto

![Pagina de Inicio](ecommerce_frontend/media/images/pag_inicio.png)
Esta es nuestra página de inicio, cuenta con el login, y el acceso mediante https protocol.


![Validación del login](ecommerce_frontend/media/images/pag_validacion_login.png)
Se muestra un ejemplo de la validacion del login usando las librerias de validación de Material UI.


![Pagina de Registro](ecommerce_frontend/media/images/pag_registro.png)
Se muestra el formulario desarrollado en Angular con Material UI para el registro


![Ejemplos de validaciones Registro (1)](ecommerce_frontend/media/images/pag_validacion_registro_1.png)
Se muestra un ejemplo de las validaciones de tipo required


![Ejemplos de validaciones Registro (2)](ecommerce_frontend/media/images/pag_validacion_registro_2.png)
Algunos ejemplos de validacion personalizadas:
En el caso del email, ahí se observa como se realiza una subscripción a un endpoint de nuestro backend que devuelve la existencia o no del email en las tablas Customer y User.
En el caso del zip code, se customizó una validación para que solo aceptara valores numéricos.
En el caso de los campos passwords, se personalizó una validación para cuando ambos no coincidieran.

![Módulo de administración](ecommerce_frontend/media/images/pag_administracion.png)
El admin del proyecto tendrá acceso a:
Manage Customers, Manage Products, Manage Orders y User.

![Módulo de Manage Products List](ecommerce_frontend/media/images/pag_products_admin_1.png)

![Módulo de Manage Products Add](ecommerce_frontend/media/images/pag_products_admin_2.png)

![Módulo de Manage Products Edit](ecommerce_frontend/media/images/pag_products_admin_3.png)

Mostramos un ejemplo del CRUD de Manage Products.


![Módulo de Customer](ecommerce_frontend/media/images/pag_customer.png)
El customer del proyecto tendrá acceso a:
Products (con otro formato), My Cart y My Orders. Se mostrará un Toast en el top-center de la página principal indicándole al customer que tiene artículos pendientes en su carrito (cart), con un link directo al checkout.

![Módulo de Notification Cart Details](ecommerce_frontend/media/images/pag_cart_notifications.png)
Aquí el customer podrá ver su lista de artículos en su carrito, asi como el detalle de cada uno al hacer mouse over (tooltip) y el monto total de esa selección. También tendrá un link a checkout directamente.


![Módulo de Productos en Customers](ecommerce_frontend/media/images/pag_products_customer.png)
Aquí se observa la vista de productos para los clientes, en este caso el cliente podrá selecciona la cantidad (no más de lo que hay en stock), podrá selecciona el size (en caso que el producto lo tenga) y le mostrará un warning para aquellos productos que tienen baja disponibilidad. En el botón ```Add to Cart```, podrá añadirlo directamente a su carrito.


![Módulo de Cart](ecommerce_frontend/media/images/pag_cart.png)

![Módulo de Cart 2](ecommerce_frontend/media/images/pag_cart_2.png)

Aquí se observa la vista del carrito del customer, aqui en la primera columna puede seleccionar o deseleccionar todos, o uno por uno. El monto real se va reflejando dinámicamente en la parte superior. Y al dar click en checkout, los productos seleccioandos automáticamente se convierten en orders.


![Módulo de Orders](ecommerce_frontend/media/images/pag_orders.png)
Aquí se observan las órdenes del customer y el monto total gastado en los productos que ha comprado.

## Seguridad

![Módulo de Seguridad](ecommerce_frontend/media/images/pag_security1.png)
Cuando se intenta acceder a una página a la cual no se tiene permiso o no existe, se muestra este error 404 con un link de redirección hacia el dashboard. Por ejemplo, si el usuario de role ```user``` intenta acceder al Manage Customers, se mostrará este error.

![Módulo de Seguridad](ecommerce_frontend/media/images/pag_security2.png)
Accesos para el rol de ```administrator```

![Módulo de Seguridad](ecommerce_frontend/media/images/pag_security3.png)
Accesos para el rol de ```user```

## Chatbot

![Módulo de Chatbot](ecommerce_frontend/media/images/pag_chatbot1.png)
Se creó un chatbot usando la API de OpenAI con su modelo ```gpt-4o-mini```. Dicho componente es la parte inferior derecha de la pantalla con un zIndex superior para que sea visible y accesible en todos los componentes de la aplicación

![Módulo de Chatbot](ecommerce_frontend/media/images/pag_chatbot2.png)
Se creó una función que devuelve en dependencia del mensaje escrito por el usuario la información de los productos relacionados con el mismo, su precio y stock. Dicha función también detecta el idioma

![Módulo de Chatbot](ecommerce_frontend/media/images/pag_chatbot3.png)
Ejemplo de un mensaje en inglés.

## Despliegue en AWS

![Módulo de Despliegue](ecommerce_frontend/media/images/pag_domain.png)
Se creó un dominio en AWS para el despliegue de nuestra aplicación con una zona host llamada ```ecommerce.reyes-fullstack-dev.com```.

![Módulo de Despliegue](ecommerce_frontend/media/images/pag_load_balancers.png)
Se crearon dos ```load balancers``` para el despliegue de nuestros servicios, frontend y backend.

![Módulo de Despliegue](ecommerce_frontend/media/images/pag_target_groups.png)
Se crearon dos ```target groups``` para el despliegue de nuestros servicios, frontend y backend. Uno escuchará por el puerto 4200 y el otro por el 8000.

![Módulo de Despliegue](ecommerce_frontend/media/images/pag_ecr.png)
Se crearon dos ```ECR (Elastic Container Registry)``` para guardar las imagenes de los repos, backend y frontend.

![Módulo de Despliegue](ecommerce_frontend/media/images/pag_cluster.png)
Se creó un cluster en ```ECS (Elastic Container Service)``` para nuestros dos servicios.

![Módulo de Despliegue](ecommerce_frontend/media/images/pag_services.png)
Se crearon dos servicios para las dos ```task definitions``` de nuestra aplicación.

![Módulo de Despliegue](ecommerce_frontend/media/images/pag_tasks.png)
Se crearon dos ```task definitions``` con listeners HTTP por el puerto 80, ancladas a las imágenes respectivas de cada ECR y con cada uno de sus respectivos ```load balancers```.

![Módulo de Despliegue](ecommerce_frontend/media/images/pag_db1.png)
![Módulo de Despliegue](ecommerce_frontend/media/images/pag_db2.png)
Se creó una BD en Postgres en su versión 16, usando el servicio de AWS ```RDS```.

![Módulo de Despliegue](ecommerce_frontend/media/images/pag_inicio_aws.png)
![Módulo de Despliegue](ecommerce_frontend/media/images/pag_inicio2_aws.png)
![Módulo de Despliegue](ecommerce_frontend/media/images/pag_inicio3_aws.png)
Se observa nuestra aplicación corriendo en AWS.










