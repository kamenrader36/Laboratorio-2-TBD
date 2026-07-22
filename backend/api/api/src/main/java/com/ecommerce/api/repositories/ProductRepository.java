package com.ecommerce.api.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ecommerce.api.entities.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.productDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    @Modifying
    @Transactional
    @Query(value = "CALL apply_discount(:idCategory, :percentage)", nativeQuery = true)
    void applyDiscount(@Param("idCategory") Long idCategory, @Param("percentage") int percentage);

    List<Product> findByUser_AuthUser_Username(String username);

    boolean existsBySkuProduct(Long skuProduct);

    Optional<Product> findByIdProductAndUser_AuthUser_Username(Long idProduct, String username);

    boolean existsBySkuProductAndIdProductNot(Long skuProduct, Long idProduct);
}