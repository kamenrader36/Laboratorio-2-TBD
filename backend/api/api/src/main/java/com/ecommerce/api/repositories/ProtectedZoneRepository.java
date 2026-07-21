package com.ecommerce.api.repositories;

import com.ecommerce.api.entities.ProtectedZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProtectedZoneRepository extends JpaRepository<ProtectedZone, Long> {
}