package com.ecommerce.api.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.api.entities.CartDetail;

@Repository
public interface CartDetailRepository extends JpaRepository<CartDetail, Long> {
}
