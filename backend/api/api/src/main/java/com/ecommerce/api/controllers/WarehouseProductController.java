package com.ecommerce.api.controllers;


import com.ecommerce.api.dto.WarehouseProductDTO;
import com.ecommerce.api.entities.WarehouseProduct;
import com.ecommerce.api.services.WarehouseProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class WarehouseProductController {
    @Autowired
    private WarehouseProductService warehouseProductService;

    @PostMapping("/add")
    public ResponseEntity<?> addProductToWarehouse(@RequestBody WarehouseProductDTO dto, Authentication authentication) {
        String currentUsername = authentication.getName();
        String response = warehouseProductService.addProductToWarehouse(dto, currentUsername);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/warehouse/{idWarehouse}")
    public ResponseEntity<?> getProductsByWarehouse(@PathVariable Long idWarehouse, Authentication authentication) {

        String currentUsername = authentication.getName();
        List<WarehouseProduct> inventory = warehouseProductService.getInventoryByWarehouse(idWarehouse, currentUsername);

        return ResponseEntity.ok(inventory);
    }
}
