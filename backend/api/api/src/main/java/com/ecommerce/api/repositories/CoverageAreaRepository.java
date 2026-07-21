package com.ecommerce.api.repositories;

import com.ecommerce.api.entities.CoverageArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoverageAreaRepository extends JpaRepository<CoverageArea, Long> {
}