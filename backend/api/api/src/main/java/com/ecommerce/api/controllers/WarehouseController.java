package com.ecommerce.api.controllers;

import com.ecommerce.api.dto.StoreDTO;
import com.ecommerce.api.services.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> createStore(@RequestBody StoreDTO store){
        String response = warehouseService.createStore(store);
        return ResponseEntity.ok(response);
    }
}
