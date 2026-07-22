package com.ecommerce.api.repositories;

import com.ecommerce.api.entities.WarehouseProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseProductRepository extends JpaRepository<WarehouseProduct, Long> {
    Optional<WarehouseProduct> findByWarehouse_IdWarehouseAndProduct_IdProduct(Long idWarehouse, Long idProduct);
    List<WarehouseProduct> findByWarehouse_IdWarehouse(Long idWarehouse);
}
