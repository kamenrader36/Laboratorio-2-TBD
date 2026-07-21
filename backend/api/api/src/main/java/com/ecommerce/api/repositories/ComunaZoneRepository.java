package com.ecommerce.api.repositories;

import com.ecommerce.api.entities.ComunaZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComunaZoneRepository extends JpaRepository<ComunaZone, Long> {
}