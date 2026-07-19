
---Función con la lógica matematica para determinar si se compra más del stock disponible

CREATE OR REPLACE FUNCTION check_stock_before_order()
    RETURNS TRIGGER AS $$
DECLARE
    actualStock NUMERIC;
BEGIN
    SELECT stock INTO actualStock
    FROM products
    WHERE id_product = NEW.id_product;

    IF NEW.quantity > actualStock THEN
        RAISE EXCEPTION 'EL PRODUCTO TIENE STOCK INSUFICIENTE DEL PRODUCTO %, TIENE DISPONIBLE: %, Y SE SOLICITA: %', NEW.id_product, actualStock, NEW.quantity;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

----Trigger que evita el registro de productos que pidan mas que el stock disponible
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


SELECT name_user, last_purchase FROM users WHERE id_user = 2;
-- triger que se ejecutara al cambiar el status de pendiente a aprobado
CREATE TRIGGER trigger_last_purchase
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
EXECUTE FUNCTION update_last_Purchase();

-- Trigger que revisa si es que la direccion esta dentro del area de cobertura
CREATE OR REPLACE FUNCTION check_client_adress_in_coberture()
    RETURNS TRIGGER AS $$
DECLARE
    c_adress GEOMETRY(Point, 4326);
    c_is_inside BOOLEAN;
BEGIN
    SELECT adress_location INTO c_adress
    FROM users
    WHERE id_user = NEW.id_user;

    SELECT ST_Contains(area, c_adress) INTO c_is_inside
    FROM coverage_areas
    WHERE id_area = 1;

    IF c_is_inside IS FALSE OR c_is_inside IS NULL THEN
        RAISE EXCEPTION 'Operacion denegada: La direcciòn del usuario se encuentra fuera del `area de cobertura', NEW.id_user;
    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

--- Trigger que se ejecuta cuando se realiza una orden viendo si la direccion se encuentra dentro del area de cobertura
CREATE TRIGGER trigger_coberture_area
    BEFORE INSERT ON payments
    FOR EACH ROW
EXECUTE FUNCTION check_client_adress_in_coberture();

--- vista materializada de "ventas mensuales por categorias de productos"
CREATE MATERIALIZED VIEW  monthly_sales_by_product_category AS
SELECT DATE_TRUNC('month',p.payment_date) AS month,
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
    c.Category_name

order by month, total_sales_amount DESC;

-- Procedure
CREATE OR REPLACE PROCEDURE checkout_cart(
    p_id_user        INT,
    p_payment_method VARCHAR
) LANGUAGE plpgsql
AS $$
DECLARE
    v_item             RECORD;
    v_total            DOUBLE PRECISION := 0;
    v_subtotal         DOUBLE PRECISION;
    v_id_payment       INT;
    v_id_shopping_cart INT;
    v_status           VARCHAR := 'PENDING';
    v_client_location GEOMETRY (Point, 4326);
    v_closest_warehouse INT;
BEGIN
    IF p_payment_method = 'CARD' THEN
        v_status := 'APPROVED';
    END IF;

    SELECT id_shopping_cart INTO v_id_shopping_cart
    FROM shopping_cart
    WHERE id_user = p_id_user;

    SELECT adress_location INTO v_client_location
    FROM users
    WHERE id_user = p_id_user;

    SELECT id_warehouse INTO v_closest_warehouse
    FROM warehouse
    ORDER BY ST_Distance(location_warehouse, v_client_location) ASC
    LIMIT 1;

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
                UPDATE products
                SET stock = stock - v_item.quantity
                WHERE id_product = v_item.id_product;
            END IF;
        END LOOP;

    DELETE FROM cart_detail
    WHERE id_shopping_cart = v_id_shopping_cart;
END;
$$;

CREATE OR REPLACE PROCEDURE restore_stock_on_cancel(p_id_payment INT)
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE products p
    SET stock = stock + dp.quantity
    FROM detail_payment dp
    WHERE dp.id_payment = p_id_payment
      AND dp.id_product = p.id_product;
END;
$$;

CREATE OR REPLACE PROCEDURE  apply_discount(
    p_id_category INT,
    p_percent_discount INT
)LANGUAGE plpgsql
AS $$
DECLARE
BEGIN
    UPDATE products
    SET original_price = product_price,
        product_price = product_price * (1 - p_percent_discount / 100.0),
        percent_discount = p_percent_discount
    WHERE id_category = p_id_category AND percent_discount = 0;
END;
$$;

---Index
CREATE INDEX index_products_sku ON products(SKU_product);
CREATE INDEX index_payments_user ON payments(id_user);
CREATE INDEX index_products_name ON  products(product_name);
CREATE INDEX index_products_description ON products(product_description);
CREATE INDEX index_warehouse_location ON warehouse USING GIST (location_warehouse);
CREATE INDEX index_user_adress ON users USING GIST (adress_location);
CREATE INDEX index_coberture_area ON coberture_area USING GIST (area);
