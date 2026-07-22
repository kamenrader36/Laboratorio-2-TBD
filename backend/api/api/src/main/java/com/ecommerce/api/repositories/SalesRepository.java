package com.ecommerce.api.repositories;

import com.ecommerce.api.dto.PaymentDTO;
import com.ecommerce.api.dto.PurchaseDetailDTO;
import com.ecommerce.api.dto.SalesDTO;
import com.ecommerce.api.entities.Payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SalesRepository extends JpaRepository<Payment, Long> {

    @Query(value = """
        SELECT month, category_name AS categoryName, 
               total_products_sold AS totalProductsSold, total_sales_amount AS totalSalesAmount 
        FROM monthly_sales_by_product_category 
        WHERE id_user = :idUser
        """, nativeQuery = true)
    List<SalesDTO> findByUser(@Param("idUser") Long idUser);

    @Procedure(procedureName = "checkout_cart")
    void checkout(
            @Param("p_id_user") Long idUser,
            @Param("p_payment_method") String paymentMethod
    );
    @Modifying
    @Transactional
    @Query(value = "CALL restore_stock_on_cancel(:idPayment)", nativeQuery = true)
    void restoreStock(@Param("idPayment") Long idPayment);

    @Modifying
    @Transactional
    @Query("UPDATE Payment p SET p.status = 'APPROVED' WHERE p.idPayment = :idPayment")
    void approvePayment(@Param("idPayment") Long idPayment);

    @Modifying
    @Transactional
    @Query("UPDATE Payment p SET p.status = 'CANCELLED' WHERE p.idPayment = :idPayment")
    void cancelPayment(@Param("idPayment") Long idPayment);

    @Modifying
    @Transactional
    @Query(value = """
        UPDATE warehouse_products wp
        SET quantity = wp.quantity - dp.quantity
        FROM detail_payment dp
        JOIN payments pay ON pay.id_payment = dp.id_payment
        WHERE wp.id_product = dp.id_product 
          AND dp.id_payment = :idPayment
          AND wp.id_warehouse = pay.id_warehouse
        """, nativeQuery = true)
    void discountStockFromPayment(@Param("idPayment") Long idPayment);

    @Query("SELECT p.status FROM Payment p WHERE p.idPayment = :idPayment")
    String getPaymentStatus(@Param("idPayment") Long idPayment);

    @Query("SELECT p.user.idUser FROM Payment p WHERE p.idPayment = :idPayment")
    Long getPaymentOwner(@Param("idPayment") Long idPayment);

    @Query("""
        SELECT new com.ecommerce.api.dto.PaymentDTO(
            p.idPayment, p.user.idUser, p.total, p.paymentDate, p.status, p.paymentMethod
        ) 
        FROM Payment p WHERE p.status = 'PENDING'
    """)
    List<PaymentDTO> getPendingPayments();

    @Query("""
        SELECT new com.ecommerce.api.dto.PaymentDTO(
            p.idPayment, p.user.idUser, p.total, p.paymentDate, p.status, p.paymentMethod
        ) 
        FROM Payment p WHERE p.user.idUser = :idUser 
        ORDER BY p.paymentDate DESC
    """)
    List<PaymentDTO> getPaymentsByUser(@Param("idUser") Long idUser);

    @Query("""
        SELECT new com.ecommerce.api.dto.PurchaseDetailDTO(
            p.idPayment, p.paymentDate, pr.productName, dp.unitPrice, dp.quantity, dp.subtotal
        ) 
        FROM Payment p 
        JOIN p.details dp 
        JOIN dp.product pr 
        WHERE p.idPayment = :idPayment
    """)
    List<PurchaseDetailDTO> getInvoiceDetails(@Param("idPayment") Long idPayment);
}