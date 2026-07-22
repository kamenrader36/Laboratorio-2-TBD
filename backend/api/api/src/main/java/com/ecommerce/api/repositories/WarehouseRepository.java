package com.ecommerce.api.repositories;

import com.ecommerce.api.entities.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    List<Warehouse> findByUser_IdUser(Long idUser);
    List<Warehouse> findByUser_AuthUser_Username(String username);
    Optional<Warehouse> findByIdWarehouseAndUser_AuthUser_Username(Long idWarehouse, String username);
}
