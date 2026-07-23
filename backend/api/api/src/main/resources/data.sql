CREATE EXTENSION IF NOT EXISTS postgis;

TRUNCATE TABLE
    cart_detail, 
    shopping_cart, 
    warehouse_products,
    detail_payment,
    payments,
    products, 
    categories, 
    users, 
    warehouse, 
    coberture_area, 
    auth_user, 
    roles 
RESTART IDENTITY CASCADE;

-- =====================
-- 1. ROLES
-- =====================
INSERT INTO roles (id_role, name_role) VALUES (1, 'ADMIN') ON CONFLICT (id_role) DO NOTHING;
INSERT INTO roles (id_role, name_role) VALUES (2, 'USER')  ON CONFLICT (id_role) DO NOTHING;

-- =====================
-- 2. AUTH USERS
-- =====================
INSERT INTO auth_user (id_auth, username, password, email, id_role) VALUES
                                                                        (1, 'jean.rojas', '$2a$12$t9i6h/nyBBuqEYLGyVbf2en17FPrnpDtYT5MChGXie0ct85s9BcrO', 'jean.rojas@mail.com', 1),
                                                                        (2, 'manuel.orellana', '$2a$12$t9i6h/nyBBuqEYLGyVbf2en17FPrnpDtYT5MChGXie0ct85s9BcrO', 'manuel.orellana@mail.com', 2),
                                                                        (3, 'luciano.carril', '$2a$12$t9i6h/nyBBuqEYLGyVbf2en17FPrnpDtYT5MChGXie0ct85s9BcrO', 'luciano.carril@mail.com', 2);

-- =====================
-- 3. USERS
-- =====================
-- Jean Rojas (Santiago Centro)
INSERT INTO users (id_user, name, rut, address, location, phone, id_auth)
VALUES (1, 'Jean Rojas', '12345678-1', 'Calle Falsa 123', ST_SetSRID(ST_MakePoint(-70.6506, -33.4372), 4326), '23242442', 1);

-- Manuel Orellana (Ubicado LEJOS en Melipilla: -71.2166, -33.6850)
INSERT INTO users (id_user, name, rut, address, location, phone, id_auth)
VALUES (2, 'Manuel Orellana', '98765432-2', 'Av. Mackenna 1200', ST_SetSRID(ST_MakePoint(-71.2166, -33.6850), 4326), '99887766', 2);

-- Luciano Carril (San Miguel)
INSERT INTO users (id_user, name, rut, address, location, phone, id_auth)
VALUES (3, 'Luciano Carril', '11223344-3', 'Gran Avenida 5000', ST_SetSRID(ST_MakePoint(-70.6828, -33.4533), 4326), '88776655', 3);

-- =====================
-- 4. COBERTURE AREA (Gran Santiago)
-- =====================
INSERT INTO coberture_area (area_name, area)
VALUES (
           'Cobertura Gran Santiago',
           ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-70.80 -33.30, -70.50 -33.30, -70.50 -33.60, -70.80 -33.60, -70.80 -33.30)')), 4326)
       );

-- =====================
-- 5. WAREHOUSES
-- =====================
-- Almacén 1: Santiago Centro
INSERT INTO warehouse (id_warehouse, name, address, location, id_user)
VALUES (
           1,
           'Almacen Central',
           'Av. Alameda 3363',
           ST_SetSRID(ST_MakePoint(-70.6500, -33.4400), 4326),
           1
       );

-- =====================
-- 6. CATEGORIES
-- =====================
INSERT INTO categories (id_category, category_name, category_description, is_hazardous) VALUES
                                                                                            (1, 'Herramientas', 'Herramientas manuales y eléctricas', false),
                                                                                            (2, 'Escaleras', 'Escaleras de aluminio y fibra', false),
                                                                                            (3, 'Repuestos', 'Ruedas, tornillos y fijaciones', false),
                                                                                            (4, 'Pinturas', 'Brochas, rodillos y esmaltes', false);

-- =====================
-- 7. PRODUCTS (Catálogo amplio para el Home)
-- =====================
INSERT INTO products (id_product, id_category, id_user, sku_product, product_name, product_description, product_price, stock) VALUES
                                                                                                                                  (1, 1, 1, '1001', 'Martillo', 'Martillo acero 500g con mango de goma', 8990, 50),
                                                                                                                                  (2, 1, 1, '1002', 'Destornillador', 'Destornillador Phillips #2 profesional', 4990, 80),
                                                                                                                                  (3, 1, 1, '1003', 'Taladro Inalámbrico', 'Taladro percutor 18V con 2 baterías', 45990, 20),
                                                                                                                                  (4, 2, 1, '2001', 'Escalera Aluminio', 'Escalera multipropósito 4 escalones', 29990, 15),
                                                                                                                                  (5, 2, 1, '2002', 'Escalera Telescópica', 'Escalera extensible 3.8 metros', 68990, 10),
                                                                                                                                  (6, 3, 1, '3001', 'Set Tornillos 100u', 'Tornillos autoperforantes para madera', 3490, 150),
                                                                                                                                  (7, 3, 1, '3002', 'Rueda Industrial', 'Rueda giratoria con freno 4 pulgadas', 7990, 40),
                                                                                                                                  (8, 4, 1, '4001', 'Kit Pintura Brochas', 'Set de 3 brochas + rodillo antigota', 11990, 30);

-- =====================
-- 8. WAREHOUSE PRODUCTS (Stock en Bodega Central)
-- =====================
INSERT INTO warehouse_products (id_warehouse, id_product, quantity) VALUES
                                                                        (1, 1, 50),
                                                                        (1, 2, 80),
                                                                        (1, 3, 20),
                                                                        (1, 4, 15),
                                                                        (1, 5, 10),
                                                                        (1, 6, 150),
                                                                        (1, 7, 40),
                                                                        (1, 8, 30);

-- =====================
-- 9. CARRITO PRECARGADO INICIAL (Manuel en Melipilla)
-- =====================
INSERT INTO shopping_cart (id_shopping_cart, id_user) VALUES (1, 2);
INSERT INTO cart_detail (id_shopping_cart, id_product, quantity) VALUES (1, 1, 1); -- 1 Martillo

-- ============================================================
-- REAJUSTE GLOBAL DE SECUENCIAS
-- ============================================================
SELECT setval(pg_get_serial_sequence('auth_user', 'id_auth'), (SELECT COALESCE(MAX(id_auth), 1) FROM auth_user), true);
SELECT setval(pg_get_serial_sequence('users', 'id_user'), (SELECT COALESCE(MAX(id_user), 1) FROM users), true);
SELECT setval(pg_get_serial_sequence('products', 'id_product'), (SELECT COALESCE(MAX(id_product), 1) FROM products), true);
SELECT setval(pg_get_serial_sequence('warehouse', 'id_warehouse'), (SELECT COALESCE(MAX(id_warehouse), 1) FROM warehouse), true);
SELECT setval(pg_get_serial_sequence('categories', 'id_category'), (SELECT COALESCE(MAX(id_category), 1) FROM categories), true);
SELECT setval(pg_get_serial_sequence('shopping_cart', 'id_shopping_cart'), (SELECT COALESCE(MAX(id_shopping_cart), 1) FROM shopping_cart), true);


/* 
===================================================================
  PASO MANUAL DE PRUEBA: ACERCAR A MANUEL Y CARGAR 1 MARTILLO
  (Descomentar y ejecutar en la BD cuando se quiera simular la compra exitosa)
===================================================================

-- 1. Acercar a Manuel (id_user = 2) a Santiago Centro
UPDATE users 
SET location = ST_SetSRID(ST_MakePoint(-70.6510, -33.4405), 4326),
    address = 'Av. Alameda 3400'
WHERE id_user = 2;

-- 2. Asegurar carrito activo para Manuel
INSERT INTO shopping_cart (id_user) 
VALUES (2) 
ON CONFLICT (id_user) DO NOTHING;

-- 3. Dejar solo 1 Martillo en el carrito
DELETE FROM cart_detail 
WHERE id_shopping_cart = (SELECT id_shopping_cart FROM shopping_cart WHERE id_user = 2);

INSERT INTO cart_detail (id_shopping_cart, id_product, quantity)
VALUES (
    (SELECT id_shopping_cart FROM shopping_cart WHERE id_user = 2),
    1,
    1
);

*/