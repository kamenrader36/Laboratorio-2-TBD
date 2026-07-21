package com.ecommerce.api.repositories;

import com.ecommerce.api.entities.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WharehouseRepository extends JpaRepository<Warehouse, Integer> {

}
