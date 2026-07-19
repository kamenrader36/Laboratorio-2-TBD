package com.ecommerce.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.api.entities.AuthUser;

import java.util.Optional;

@Repository
public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<AuthUser> findByUsernameOrEmail(String username, String email);
}