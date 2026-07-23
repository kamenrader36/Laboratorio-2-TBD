🛒 Laboratorio-1-TBD

Este repositorio contiene un sistema de e-commerce enfocado en el modelo Business-to-Business (B2B).
Permite realizar transacciones comerciales entre empresas, como la compra, venta y gestión de inventario.

El sistema facilita la comunicación entre empresas, permitiendo:

Comprar y vender productos
Gestionar inventario
Filtrar productos por categorías

Tecnologías utilizadas

***Backend***
- Java 25 
- Spring Boot
- PostgreSQL (PostGIS)
- JWT (autenticación)

***Frontend***
- React
- Vite
- Axios

Requisitos previos

Tener instalado:

Java 
Maven
PostgreSQL
PostGIS (versión 3.6.2)
Node.js y npm

Variables de entorno

Configurar las siguientes variables para la conexión a la base de datos:

- DB_HOST=localhost
- DB_PORT=5432
- DB_NAME=nombre_db
- DB_USER=postgres
- DB_PASSWORD=tu_password

***Configuración e Inicialización de la Base de Datos***
**1. Crear la base de datos**

Con las variables de entorno de PostgreSQL configuradas, ejecutar:
```bash
bash:

psql -U postgres -c "CREATE DATABASE \"nombre_db\";"
```
Este comando solicitará la contraseña del usuario de PostgreSQL.

**2. Habilitar la extensión PostGIS**

Conectarse a la base de datos recién creada y habilitar la extensión:
```bash
bash:

psql -U postgres -d nombre_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

**3. Levantar el backend para generar las tablas**

Entrar al proyecto y ejecutar el backend, esto permitirá que Hibernate/JPA cree automáticamente 
las tablas según las entidades definidas:
```bash
bash:

cd backend/api/api
mvn spring-boot:run
```
Una vez que las tablas se hayan creado, detener el proceso (Ctrl+C) para continuar con la carga del esquema y los datos.

**4. Cargar el esquema**

Situándose en la raíz del proyecto (carpeta donde está el archivo schema.sql), ejecutar:
```bash
bash:

psql -U postgres -d nombre_db -f schema.sql
```

**5. Cargar los datos**

Finalmente, cargar los datos iniciales:
```bash
bash:

psql -U postgres -d nombre_db -f data.sql
```

Con esto la base de datos queda creada, configurada con PostGIS, con las tablas generadas por el backend, 
el esquema aplicado y los datos cargados.

**6. Levantar el backend nuevamente**

```bash
bash:

mvn spring-boot:run
```

Ejecución del Frontend

Ir al frontend:
```bash
bash:
cd frontend
```
Instalar dependencias: **IMPORTANTE**
```bash
bash:
npm install
```
Ejecutar:
```bash
bash:
npm start
```
ya tienes la aplicacion corriendo.

***Endpoints***

//Auth
POST http://localhost:8090/api/auth/register
{
    "username": "jean.rojas",
    "password": "12345678",
    "confirmPassword": "12345678",
    "email": "jean.rojas@mail.com",
    "name_user": "Jean Rojas",
    "rut": "12345678-9",
    "address": "Avenida Siempre Viva 742",
    "phone": "+56912345678"
}
Ruta para registrar a un usuario, siempre registrara a un usuario como user, el administrador viene registrado desde que se levanta la pagina

POST http://localhost:8090/api/auth/login
{
    "identifier": "jean.rojas" o "jean.rojas@mail.com",
    "password": "12345678"
}
Ruta para loguear a un usuario a traves de su username o correo registrado, devuelve el access token que servira para usar las diferentes rutas

//Users
GET http://localhost:8090/api/users/me
Endpoint que funciona con Bearer Token donde se envia el token del usuario para recibir sus datos de perfil
Ruta ADMIN o USER

GET http://localhost:8090/api/users/profiles
Endpoint que funciona con Bearer Token donde se envia el token del usuario para recibir los perfiles de cada usuario
Ruta solo para rol ADMIN

//Products
GET http://localhost:8090/api/products/search?keyword=texto_a_buscar
Endpoint para buscar productos por coincidencias parciales en su nombre o descripción.
Ruta pública/USER

POST http://localhost:8090/api/products/publish
Endpoint que funciona con Bearer Token donde se envía el token del usuario para publicar un nuevo producto, 
el usuario autenticado queda asociado como vendedor del producto.
Ruta ADMIN o USER

POST http://localhost:8090/api/products/apply-discount
Endpoint que aplica un descuento masivo a todos los productos pertenecientes a una categoría específica.

//Cart
GET http://localhost:8090/api/cart/my-cart
Endpoint que funciona con Bearer Token donde se envia el token del usuario para recibir el contenido de su carrito

POST http://localhost:8090/api/cart/add
Endpoint que funciona con Bearer Token donde se envía el token del usuario para agregar un producto al carrito.
Ruta ADMIN o USER

//Sales
GET http://localhost:8090/api/sales/my-orders
Endpoint que funciona con Bearer Token donde se envia el token del usuario para recibir sus compras
Ruta solo para rol USER

POST http://localhost:8090/api/sales/checkout?paymentMethod={CARD o TRANSFER}
Endpoint que funciona con bearer Token donde se envia el token del usuario y ademas se manda como param el medio de pago que realiza en caso de ser card se guarda como pago aprobado en otro caso pendiente
Ruta solo para rol USER

GET http://localhost:8090/api/sales/pending
Endpoint que funciona con bearer Token donde se envia el token del usuario.
Ruta solo para rol ADMIN

PATCH http://localhost:8090/api/sales/{id_payment}/approve
Endpoint que funciona con bearer Token donde se envia el token del usuario
Ruta solo para rol ADMIN

PATCH http://localhost:8090/api/sales/{id_payment}/cancel
Endpoint que funciona con bearer Token donde se envia el token del usuario, puede un usuario cancelar su propia compra o un administrador cancelar una compra aprobada o pendiente.
Ruta ADMIN o USER

GET http://localhost:8090/api/sales/{id_payment}/purchase
Endpoint que reconstruye el detalle histórico de una factura cruzando la información de pagos, detalles y productos.
Ruta ADMIN o USER

GET http://localhost:8090/api/sales/my-sales
Endpoint que calcula y almacena un reporte mensual de ventas agrupados por categoria de productos, ademas devuelve la cantidad total de articulos vendidos, cuenta solamente los que tenga pagos aprobados
Ruta solo para rol USER

GET http://localhost:8090/api/sales/by-comuna
Endpoint que devuelve un reporte de ventas agrupado por comuna.
Ruta solo para rol ADMIN

//Warehouse (Store)
POST http://localhost:8090/api/store/create
Endpoint que funciona con Bearer Token donde se envía el token del usuario para crear una nueva bodega, 
asociada al usuario autenticado como propietario.
Ruta ADMIN o USER

GET http://localhost:8090/api/store/my-warehouses
Endpoint que funciona con Bearer Token donde se envía el token del usuario para recibir el listado de bodegas asociadas a ese usuario.
Ruta ADMIN o USER

//Inventory
POST http://localhost:8090/api/inventory/add
Endpoint que funciona con Bearer Token donde se envía el token del usuario para agregar un producto al inventario de una bodega específica.
Ruta ADMIN o USER

GET http://localhost:8090/api/inventory/warehouse/{idWarehouse}
Endpoint que funciona con Bearer Token donde se envía el token del usuario para recibir el inventario de productos de una bodega específica.
Ruta ADMIN o USER
