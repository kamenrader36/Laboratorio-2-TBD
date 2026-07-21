CREATE OR REPLACE FUNCTION check_stock_before_order()
    RETURNS TRIGGER AS $$
DECLARE
    actualStock NUMERIC;
BEGIN
    SELECT wp.quantity INTO actualStock
    FROM warehouse_products wp
             JOIN payments p ON p.id_warehouse = wp.id_warehouse
    WHERE p.id_payment = NEW.id_payment AND wp.id_product = NEW.id_product;

    IF NEW.quantity > actualStock THEN
        RAISE EXCEPTION 'STOCK INSUFICIENTE DEL PRODUCTO %. DISPONIBLE: %, SOLICITADO: %', NEW.id_product, actualStock, NEW.quantity;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stock
    BEFORE INSERT ON detail_payment
    FOR EACH ROW
EXECUTE FUNCTION check_stock_before_order();

--- Trigger para modificar el campo last_purchase
CREATE OR REPLACE FUNCTION update_last_Purchase()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'APPROVED' THEN
        UPDATE users
        SET last_purchase = NEW.payment_date
        WHERE id_user = NEW.id_user;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_last_purchase
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
EXECUTE FUNCTION update_last_Purchase();

--- Trigger de cobertura corregido: Homogeneizado para usar 'location'
CREATE OR REPLACE FUNCTION check_client_adress_in_coberture()
    RETURNS TRIGGER AS $$
DECLARE
    c_address GEOMETRY(Point, 4326);
    c_is_inside BOOLEAN;
BEGIN
    SELECT location INTO c_address
    FROM users
    WHERE id_user = NEW.id_user;

    SELECT ST_Contains(area, c_address) INTO c_is_inside
    FROM coberture_area
    WHERE id_coberture = 1;

    IF c_is_inside IS FALSE OR c_is_inside IS NULL THEN
        RAISE EXCEPTION 'Operacion denegada: La dirección del usuario se encuentra fuera del área de cobertura (Usuario: %)', NEW.id_user;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_coberture_area
    BEFORE INSERT ON payments
    FOR EACH ROW
EXECUTE FUNCTION check_client_adress_in_coberture();



--- Trigger: Prevents a product in the “hazardous” category from being added to the cart

CREATE OR REPLACE FUNCTION check_hazardous_category_exclusion_zone()
    RETURNS TRIGGER AS $$
DECLARE
v_is_hazardous   BOOLEAN;
    v_client_location GEOMETRY(Point, 4326);
    v_in_protected_zone BOOLEAN;
BEGIN
SELECT c.is_hazardous INTO v_is_hazardous
FROM products p
         JOIN categories c ON c.id_category = p.id_category
WHERE p.id_product = NEW.id_product;

IF v_is_hazardous IS NOT TRUE THEN
        RETURN NEW;
END IF;

SELECT u.location INTO v_client_location
FROM shopping_cart sc
         JOIN users u ON u.id_user = sc.id_user
WHERE sc.id_shopping_cart = NEW.id_shopping_cart;

SELECT EXISTS (
    SELECT 1 FROM protected_zone pz WHERE ST_Contains(pz.area, v_client_location)
) INTO v_in_protected_zone;

IF v_in_protected_zone THEN
        RAISE EXCEPTION 'Venta denegada: el producto % pertenece a una categoría peligrosa y la dirección del cliente está dentro de una Zona Residencial Protegida.', NEW.id_product;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hazardous_exclusion_zone
    BEFORE INSERT ON cart_detail
    FOR EACH ROW
    EXECUTE FUNCTION check_hazardous_category_exclusion_zone();

--- Vista materializada de "ventas mensuales por categorias de productos"
CREATE MATERIALIZED VIEW monthly_sales_by_product_category AS
SELECT DATE_TRUNC('month', p.payment_date) AS month,
       c.id_category,
       c.category_name,
       SUM(dp.quantity) AS total_product_sold,
       SUM(dp.subtotal) AS total_sales_amount
FROM payments p
         JOIN detail_payment dp on dp.id_payment = p.id_payment
         JOIN products pr ON dp.id_product = pr.id_product
         JOIN categories c on pr.id_category = c.id_category
WHERE p.status = 'APPROVED'
GROUP BY
    DATE_TRUNC('month', p.payment_date),
    c.id_category,
    c.category_name
ORDER BY month, total_sales_amount DESC;

--- Vista materializada: Sales volume grouped by municipality, using ST_Union

CREATE MATERIALIZED VIEW sales_by_comuna AS
SELECT cz.id_comuna,
       cz.comuna_name,
       COUNT(DISTINCT p.id_payment)      AS total_orders,
       SUM(dp.quantity)                  AS total_units_sold,
       SUM(dp.subtotal)                  AS total_sales_amount,
       ST_Union(u.location)              AS clients_geom
FROM payments p
         JOIN users u ON u.id_user = p.id_user
         JOIN detail_payment dp ON dp.id_payment = p.id_payment
         JOIN comuna_zone cz ON ST_Contains(cz.area, u.location)
WHERE p.status = 'APPROVED'
GROUP BY cz.id_comuna, cz.comuna_name
ORDER BY total_sales_amount DESC;


--- Procedure: checkout_cart
CREATE OR REPLACE PROCEDURE checkout_cart(
    p_id_user        BIGINT,
    p_payment_method VARCHAR
) LANGUAGE plpgsql
AS $$
DECLARE
    v_item              RECORD;
    v_total             DOUBLE PRECISION := 0;
    v_subtotal          DOUBLE PRECISION;
    v_id_payment        BIGINT;
    v_id_shopping_cart  BIGINT;
    v_status            VARCHAR := 'PENDING';
    v_client_location   GEOMETRY(Point, 4326);
    v_closest_warehouse BIGINT;
BEGIN
    IF p_payment_method = 'CARD' THEN
        v_status := 'APPROVED';
    END IF;

    SELECT id_shopping_cart INTO v_id_shopping_cart
    FROM shopping_cart
    WHERE id_user = p_id_user;

    SELECT location INTO v_client_location
    FROM users
    WHERE id_user = p_id_user;

    SELECT wp.id_warehouse INTO v_closest_warehouse
    FROM warehouse_products wp
             JOIN cart_detail cd ON wp.id_product = cd.id_product
             JOIN warehouse w ON wp.id_warehouse = w.id_warehouse
    WHERE cd.id_shopping_cart = v_id_shopping_cart
      AND wp.quantity >= cd.quantity
      AND w.id_user != p_id_user
    GROUP BY wp.id_warehouse, w.location
    HAVING COUNT(wp.id_product) = (SELECT COUNT(*) FROM cart_detail WHERE id_shopping_cart = v_id_shopping_cart)
    ORDER BY ST_Distance(w.location, v_client_location) ASC
    LIMIT 1;

    IF v_closest_warehouse IS NULL THEN
        RAISE EXCEPTION 'Ningún almacén cercano cuenta con stock suficiente para procesar todo tu pedido.';
    END IF;

    FOR v_item IN
        SELECT cd.id_product, cd.quantity, p.product_price
        FROM cart_detail cd
                 JOIN products p ON p.id_product = cd.id_product
        WHERE cd.id_shopping_cart = v_id_shopping_cart
        LOOP
            v_subtotal := v_item.quantity * v_item.product_price;
            v_total    := v_total + v_subtotal;
        END LOOP;

    INSERT INTO payments (id_user, id_warehouse, total, payment_date, status, payment_method)
    VALUES (p_id_user, v_closest_warehouse, v_total, NOW(), v_status, p_payment_method)
    RETURNING id_payment INTO v_id_payment;

    FOR v_item IN
        SELECT cd.id_product, cd.quantity, p.product_price
        FROM cart_detail cd
                 JOIN products p ON p.id_product = cd.id_product
        WHERE cd.id_shopping_cart = v_id_shopping_cart
        LOOP
            v_subtotal := v_item.quantity * v_item.product_price;

            INSERT INTO detail_payment (id_payment, id_product, quantity, unit_price, subtotal)
            VALUES (v_id_payment, v_item.id_product, v_item.quantity, v_item.product_price, v_subtotal);

            IF v_status = 'APPROVED' THEN
                UPDATE warehouse_products
                SET quantity = quantity - v_item.quantity
                WHERE id_warehouse = v_closest_warehouse
                  AND id_product = v_item.id_product;
            END IF;
        END LOOP;

    DELETE FROM cart_detail
    WHERE id_shopping_cart = v_id_shopping_cart;
END;
$$;

--- Procedure: restore_stock_on_cancel
CREATE OR REPLACE PROCEDURE restore_stock_on_cancel(p_id_payment INT)
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE warehouse_products wp
    SET quantity = wp.quantity + dp.quantity
    FROM detail_payment dp
             JOIN payments pay ON pay.id_payment = dp.id_payment
    WHERE dp.id_payment = p_id_payment
      AND wp.id_product = dp.id_product
      AND wp.id_warehouse = pay.id_warehouse;
END;
$$;

--- Procedure: apply_discount
CREATE OR REPLACE PROCEDURE apply_discount(
    p_id_category INT,
    p_percent_discount INT
) LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE products
    SET original_price = product_price,
        product_price = product_price * (1 - p_percent_discount / 100.0),
        percent_discount = p_percent_discount
    WHERE id_category = p_id_category AND percent_discount = 0;
END;
$$;
