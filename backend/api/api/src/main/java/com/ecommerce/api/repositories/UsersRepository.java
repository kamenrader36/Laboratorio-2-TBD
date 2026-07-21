package com.ecommerce.api.repositories;

import com.ecommerce.api.dto.ProfileDTO;
import com.ecommerce.api.entities.AuthUser;
import com.ecommerce.api.entities.Profile;
import com.ecommerce.api.entities.Users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

    List<Users> findAll();
    Optional<Users> findByAuthUser(AuthUser authUser);
    Users findByAuthUser_Username(String username);

    @Query("SELECT u.idUser FROM Users u JOIN u.authUser a WHERE a.username = :username")
    Long findIdByUsername(@Param("username") String username);
}