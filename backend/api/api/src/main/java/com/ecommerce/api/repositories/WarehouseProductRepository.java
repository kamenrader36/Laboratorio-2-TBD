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
    boolean existsByWarehouse_IdWarehouse(Long idWarehouse);
    List<WarehouseProduct> findByWarehouse_IdWarehouseAndWarehouse_User_AuthUser_Username(Long idWarehouse, String username);
    Optional<WarehouseProduct> findByIdInventoryAndWarehouse_User_AuthUser_Username(Long idInventory, String username);

    List<WarehouseProduct> findByProduct_IdProduct(Long idProduct);

    List<WarehouseProduct> findByProduct_IdProductAndWarehouse_User_AuthUser_Username(Long idProduct, String username);

    void deleteByProduct_IdProduct(Long idProduct);
}