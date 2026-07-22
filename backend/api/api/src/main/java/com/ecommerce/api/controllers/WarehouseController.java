package com.ecommerce.api.controllers;

import com.ecommerce.api.dto.WarehouseDTO;
import com.ecommerce.api.entities.Warehouse;
import com.ecommerce.api.services.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/my-warehouses")
    public ResponseEntity<?> getMyWarehouses(Authentication authentication) {
        String currentUsername = authentication.getName();
        List<Warehouse> myWarehouses = warehouseService.getMyWarehouses(currentUsername);
        return ResponseEntity.ok(myWarehouses);
    }
}
