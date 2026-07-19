package com.ecommerce.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.api.entities.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
}
