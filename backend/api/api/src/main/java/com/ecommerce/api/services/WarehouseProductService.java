package com.ecommerce.api.services;

import com.ecommerce.api.dto.WarehouseProductDTO;
import com.ecommerce.api.entities.Product;
import com.ecommerce.api.entities.Warehouse;
import com.ecommerce.api.entities.WarehouseProduct;
import com.ecommerce.api.repositories.ProductRepository;
import com.ecommerce.api.repositories.UsersRepository;
import com.ecommerce.api.repositories.WarehouseProductRepository;
import com.ecommerce.api.repositories.WarehouseRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class WarehouseProductService {

    @Autowired
    private WarehouseProductRepository warehouseProductRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Transactional
    public String addProductToWarehouse(WarehouseProductDTO dto, String currentUsername) {

        Warehouse warehouse = warehouseRepository.findById(dto.getIdWarehouse())
                .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));
        if (!warehouse.getUser().getAuthUser().getUsername().equals(currentUsername)) {
            throw new SecurityException("No tienes permiso para modificar el inventario de una bodega que no te pertenece");
        }

        Product product = productRepository.findById(dto.getIdProduct())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Optional<WarehouseProduct> existingStock = warehouseProductRepository
                .findByWarehouse_IdWarehouseAndProduct_IdProduct(dto.getIdWarehouse(), dto.getIdProduct());

        if (existingStock.isPresent()) {
            WarehouseProduct inventory = existingStock.get();
            inventory.setQuantity(inventory.getQuantity() + dto.getQuantity());
            warehouseProductRepository.save(inventory);
        } else {
            WarehouseProduct newInventory = new WarehouseProduct();
            newInventory.setWarehouse(warehouse);
            newInventory.setProduct(product);
            newInventory.setQuantity(dto.getQuantity());
            warehouseProductRepository.save(newInventory);
        }

        return "Inventario actualizado correctamente";
    }
}