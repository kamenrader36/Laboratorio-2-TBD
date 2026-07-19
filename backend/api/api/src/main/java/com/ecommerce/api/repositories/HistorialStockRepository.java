package com.ecommerce.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.api.entities.HistorialStock;

@Repository
public interface HistorialStockRepository extends JpaRepository<HistorialStock, Long> {
}