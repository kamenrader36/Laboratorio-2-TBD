-- =====================
-- ROLES
-- =====================
INSERT INTO roles (id_role, name_role) VALUES (1, 'ADMIN') ON CONFLICT (id_role) DO NOTHING;
INSERT INTO roles (id_role, name_role) VALUES (2, 'USER')  ON CONFLICT (id_role) DO NOTHING;

-- =====================
-- AUTH USERS
-- =====================
-- Admin: password = 12345678
INSERT INTO auth_user (username, password, email, id_role)
VALUES ('jean.rojas', '$2a$12$t9i6h/nyBBuqEYLGyVbf2en17FPrnpDtYT5MChGXie0ct85s9BcrO', 'jean.rojas@mail.com', 1);

-- User 1: password = 12345678
INSERT INTO auth_user (username, password, email, id_role)
VALUES ('manuel.orellana', '$2a$12$t9i6h/nyBBuqEYLGyVbf2en17FPrnpDtYT5MChGXie0ct85s9BcrO', 'manuel.orellana@mail.com', 2);

-- User 2: password = 12345678
INSERT INTO auth_user (username, password, email, id_role)
VALUES ('luciano.carril', '$2a$12$t9i6h/nyBBuqEYLGyVbf2en17FPrnpDtYT5MChGXie0ct85s9BcrO', 'luciano.carril@mail.com', 2);

-- =====================
-- COBERTURE AREA
-- =====================
INSERT INTO coberture_area (area_name, area)
VALUES (
    'Cobertura Gran Santiago', 
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-70.80 -33.30, -70.50 -33.30, -70.50 -33.60, -70.80 -33.60, -70.80 -33.30)')), 4326)
);

-- =====================
-- WAREHOUSES
-- =====================
INSERT INTO warehouse (warehouse_name, location_warehouse)
VALUES ('Almacén Central (Santiago Centro)', ST_SetSRID(ST_MakePoint(-70.6600, -33.4500), 4326));

INSERT INTO warehouse (warehouse_name, location_warehouse)
VALUES ('Almacén Maipú (Bodega Sur)', ST_SetSRID(ST_MakePoint(-70.7580, -33.5100), 4326));

-- =====================
-- USERS
-- =====================
INSERT INTO users (name_user, rut, adress_location, phone, id_auth)
VALUES ('Jean Rojas', '12345678-1', ST_SetSRID(ST_MakePoint(-70.6506, -33.4372), 4326), '23242442', 1);

INSERT INTO users (name_user, rut, adress_location, phone, id_auth)
VALUES ('Manuel Orellana', '98765432-2', ST_SetSRID(ST_MakePoint(-70.5982, -33.4153), 4326), '99887766', 2);

INSERT INTO users (name_user, rut, adress_location, phone, id_auth)
VALUES ('Luciano Carril', '11223344-3', ST_SetSRID(ST_MakePoint(-70.6828, -33.4533), 4326), '88776655', 3);

-- =====================
-- CATEGORY
-- =====================
INSERT INTO categories (category_name, category_description)
VALUES ('Herramientas', 'Herramientas manuales y eléctricas');

INSERT INTO categories (category_name, category_description)
VALUES ('Escaleras', 'Escaleras de aluminio y fibra');

INSERT INTO categories (category_name, category_description)
VALUES ('Repuestos', 'Ruedas, tornillos y accesorios');

-- =====================
-- PRODUCTOS
-- Manuel (id_user=2) vende herramientas
-- =====================
INSERT INTO products (id_category, id_user, SKU_product, product_name, product_description, product_price, stock)
VALUES (1, 2, 1001, 'Martillo',        'Martillo de acero 500g',         8990,  50);

INSERT INTO products (id_category, id_user, SKU_product, product_name, product_description, product_price, stock)
VALUES (1, 2, 1002, 'Destornillador',  'Destornillador Phillips #2',     4990,  80);

INSERT INTO products (id_category, id_user, SKU_product, product_name, product_description, product_price, stock)
VALUES (2, 2, 2001, 'Escalera 3m',     'Escalera aluminio 3 metros',    29990,  20);

-- Luciano (id_user=3) vende repuestos y escaleras
INSERT INTO products (id_category, id_user, SKU_product, product_name, product_description, product_price, stock)
VALUES (2, 3, 2002, 'Escalera 5m',     'Escalera aluminio 5 metros',    49990,  15);

INSERT INTO products (id_category, id_user, SKU_product, product_name, product_description, product_price, stock)
VALUES (3, 3, 3001, 'Rueda Industrial','Rueda goma 10cm diámetro',       3990, 100);

INSERT INTO products (id_category, id_user, SKU_product, product_name, product_description, product_price, stock)
VALUES (3, 3, 3002, 'Tornillo 1/2',    'Tornillo hexagonal 1/2 pulgada',  190, 500);

-- =====================
-- CARTS
-- =====================
INSERT INTO shopping_cart (id_user) VALUES (2); -- cart Manuel
INSERT INTO shopping_cart (id_user) VALUES (3); -- cart Luciano

-- Manuel compra productos de Luciano
INSERT INTO cart_detail (id_shopping_cart, id_product, quantity) VALUES (1, 4, 2);
INSERT INTO cart_detail (id_shopping_cart, id_product, quantity) VALUES (1, 5, 3);

-- Luciano compra productos de Manuel
INSERT INTO cart_detail (id_shopping_cart, id_product, quantity) VALUES (2, 1, 1);
INSERT INTO cart_detail (id_shopping_cart, id_product, quantity) VALUES (2, 3, 2);
