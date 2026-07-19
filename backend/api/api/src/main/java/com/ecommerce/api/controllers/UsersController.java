package com.ecommerce.api.controllers;

import com.ecommerce.api.dto.ProfileDTO;
import com.ecommerce.api.entities.Profile;
import com.ecommerce.api.entities.Users;
import com.ecommerce.api.repositories.UsersRepository;
import com.ecommerce.api.services.AuthUserServices;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UsersController {
    
    @Autowired
    private UsersRepository userRepository;

    @Autowired
    private AuthUserServices authUserServices;
    
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> myProfile(Authentication authentication) {
        String username = authentication.getName();
        Users profile = userRepository.findByAuthUser_Username(username);

        if(profile == null) {
            return ResponseEntity.notFound().build();
        }
    
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/profiles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> users() {

        List<ProfileDTO> profiles = authUserServices.getAllProfiles(); 
        return ResponseEntity.ok(profiles);
    }
}