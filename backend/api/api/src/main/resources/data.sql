-- =====================
-- ROLES
-- =====================
INSERT INTO roles (id_role, name_role) VALUES (1, 'ADMIN') ON CONFLICT (id_role) DO NOTHING;
INSERT INTO roles (id_role, name_role) VALUES (2, 'USER')  ON CONFLICT (id_role) DO NOTHING;

-- =====================
-- AUTH USERS
-- =====================
-- Todos tienen clave: 12345678

INSERT INTO auth_user (id_auth, username, password, email, id_role) VALUES (1, 'jean.rojas', '$2a$12$t9i6h/nyBBuqEYLGyVbf2en17FPrnpDtYT5MChGXie0ct85s9BcrO', 'jean.rojas@mail.com', 1);
INSERT INTO auth_user (id_auth, username, password, email, id_role) VALUES (2, 'manuel.orellana', '$2a$12$t9i6h/nyBBuqEYLGyVbf2en17FPrnpDtYT5MChGXie0ct85s9BcrO', 'manuel.orellana@mail.com', 2);
INSERT INTO auth_user (id_auth, username, password, email, id_role) VALUES (3, 'luciano.carril', '$2a$12$t9i6h/nyBBuqEYLGyVbf2en17FPrnpDtYT5MChGXie0ct85s9BcrO', 'luciano.carril@mail.com', 2);

-- =====================
-- COBERTURE AREA (Trigger de validación perimetral)
-- =====================
INSERT INTO coberture_area (id_coberture, area_name, area) VALUES (1, 'Cobertura Gran Santiago', ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-70.80 -33.30, -70.50 -33.30, -70.50 -33.60, -70.80 -33.60, -70.80 -33.30)')), 4326));

-- =====================
-- PROTECTED ZONE
-- =====================
INSERT INTO protected_zone (id_zone, zone_name, area)
VALUES (1, 'Zona Residencial Protegida - San Miguel', ST_SetSRID(ST_MakeEnvelope(-70.70, -33.47, -70.66, -33.44), 4326));

-- =====================
-- COMUNAS (para la vista materializada de ventas por comuna)
-- =====================
INSERT INTO comuna_zone (id_comuna, comuna_name, area) VALUES
(1, 'Santiago Centro', ST_SetSRID(ST_MakeEnvelope(-70.68, -33.46, -70.63, -33.42), 4326)),
(2, 'Vitacura', ST_SetSRID(ST_MakeEnvelope(-70.62, -33.43, -70.57, -33.40), 4326)),
(3, 'San Miguel',ST_SetSRID(ST_MakeEnvelope(-70.70, -33.47, -70.66, -33.44), 4326));


-- =====================
-- WAREHOUSES (Puntos de Distribución Físicos)
-- =====================
-- Almacén 1: Santiago Centro
INSERT INTO warehouse (id_warehouse, name, address, location)
VALUES (1, 'Almacén Central (Santiago Centro)', 'Av. Libertador Bernardo O Higgins 1200', ST_SetSRID(ST_MakePoint(-70.6600, -33.4500), 4326));

-- Almacén 2: Maipú
INSERT INTO warehouse (id_warehouse, name, address, location)
VALUES (2, 'Almacén Maipú (Bodega Sur)', 'Av. Pajaritos 3000', ST_SetSRID(ST_MakePoint(-70.7580, -33.5100), 4326));

-- =====================
-- USERS
-- =====================
INSERT INTO users (id_user, name, rut, address, phone, id_auth, location)
VALUES (1, 'Jean Rojas', '12345678-1', 'Calle Falsa 123', '23242442', 1, ST_SetSRID(ST_MakePoint(-70.6506, -33.4372), 4326));

INSERT INTO users (id_user, name, rut, address, phone, id_auth, location)
VALUES (2, 'Manuel Orellana', '98765432-2', 'Av. Vitacura 4000', '99887766', 2, ST_SetSRID(ST_MakePoint(-70.5982, -33.4153), 4326));

INSERT INTO users (id_user, name, rut, address, phone, id_auth, location)
VALUES (3, 'Luciano Carril', '11223344-3', 'Gran Avenida 5000', '88776655', 3, ST_SetSRID(ST_MakePoint(-70.6828, -33.4533), 4326));

-- =====================
-- CATEGORIES
-- =====================
INSERT INTO categories (id_category, category_name, category_description, is_hazardous) VALUES (1, 'Herramientas', 'Herramientas manuales y eléctricas', FALSE);
INSERT INTO categories (id_category, category_name, category_description, is_hazardous) VALUES (2, 'Escaleras', 'Escaleras de aluminio y fibra', FALSE);
INSERT INTO categories (id_category, category_name, category_description, is_hazardous) VALUES (3, 'Químicos', 'Productos químicos peligrosos', TRUE);
-- =====================
-- PRODUCTS (Catálogo Global)
-- =====================
INSERT INTO products (id_product, id_category, id_user, sku_product, product_name, product_description, product_price)
VALUES (1, 1, 2, 1001, 'Martillo', 'Martillo de acero 500g', 8990);

INSERT INTO products (id_product, id_category, id_user, sku_product, product_name, product_description, product_price)
VALUES (2, 2, 2, 2001, 'Escalera 3m', 'Escalera aluminio 3 metros', 29990);

INSERT INTO products (id_product, id_category, id_user, sku_product, product_name, product_description, product_price)
VALUES (3, 3, 2, 3001, 'Acido', 'manipular con precaución', 15990);
-- =====================
-- WAREHOUSE PRODUCTS 
-- =====================
-- Caso 1: Ambos almacenes tienen el Martillo (id_product = 1)
INSERT INTO warehouse_products (id_warehouse, id_product, quantity) VALUES (1, 1, 50.0); -- El de Santiago Centro (Cercano)
INSERT INTO warehouse_products (id_warehouse, id_product, quantity) VALUES (2, 1, 100.0); -- El de Maipú (Lejano)

-- Caso 2: SOLO el almacén lejano (Maipú) tiene la Escalera (id_product = 2)
INSERT INTO warehouse_products (id_warehouse, id_product, quantity) VALUES (1, 2, 0.0);   -- Santiago Centro tiene 0
INSERT INTO warehouse_products (id_warehouse, id_product, quantity) VALUES (2, 2, 15.0);  -- Maipú tiene 15

-- =====================
-- CARTS
-- =====================
INSERT INTO shopping_cart (id_shopping_cart, id_user) VALUES (1, 2);

-- Sincronizar secuencias de Postgres
SELECT setval('roles_id_role_seq', (SELECT MAX(id_role) FROM roles));
SELECT setval('auth_user_id_auth_seq', (SELECT MAX(id_auth) FROM auth_user));
SELECT setval('users_id_user_seq', (SELECT MAX(id_user) FROM users));
SELECT setval('categories_id_category_seq', (SELECT MAX(id_category) FROM categories));
SELECT setval('products_id_product_seq', (SELECT MAX(id_product) FROM products));
SELECT setval('protected_zone_id_zone_seq', (SELECT MAX(id_zone) FROM protected_zone));
SELECT setval('comuna_zone_id_comuna_seq', (SELECT MAX(id_comuna) FROM comuna_zone));