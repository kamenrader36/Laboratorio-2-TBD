package com.ecommerce.api.controllers;

import com.ecommerce.api.dto.WarehouseDTO;
import com.ecommerce.api.services.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store")
public class WarehouseController {
    @Autowired
    private WarehouseService warehouseService;

    @PostMapping("/create")
    public ResponseEntity<?> createWarehouse(@RequestBody WarehouseDTO warehouse, Authentication authentication){
        String currentUsername = authentication.getName();
        String response = warehouseService.createWarehouse(warehouse, currentUsername);
        return ResponseEntity.ok(response);
    }
}
