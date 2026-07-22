package com.ecommerce.api.services;

import com.ecommerce.api.dto.UpdateWarehouseProductDTO;
import com.ecommerce.api.dto.WarehouseInventoryResponseDTO;
import com.ecommerce.api.dto.WarehouseProductDTO;
import com.ecommerce.api.entities.Product;
import com.ecommerce.api.entities.Warehouse;
import com.ecommerce.api.entities.WarehouseProduct;
import com.ecommerce.api.repositories.ProductRepository;
import com.ecommerce.api.repositories.WarehouseProductRepository;
import com.ecommerce.api.repositories.WarehouseRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseProductService {

    @Autowired
    private WarehouseProductRepository warehouseProductRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public String addProductToWarehouse(WarehouseProductDTO dto, String currentUsername) {
        Warehouse warehouse = warehouseRepository
                .findByIdWarehouseAndUser_AuthUser_Username(dto.getIdWarehouse(), currentUsername)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada o sin permisos"));

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

    @Transactional
    public List<WarehouseInventoryResponseDTO> getInventoryByWarehouse(Long idWarehouse, String currentUsername) {
        warehouseRepository
                .findByIdWarehouseAndUser_AuthUser_Username(idWarehouse, currentUsername)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada o sin permisos"));

        List<WarehouseProduct> inventory = warehouseProductRepository.findByWarehouse_IdWarehouse(idWarehouse);

        return inventory.stream()
                .map(item -> new WarehouseInventoryResponseDTO(
                        item.getIdInventory(),
                        item.getWarehouse().getIdWarehouse(),
                        item.getProduct().getIdProduct(),
                        item.getProduct().getProductName(),
                        item.getProduct().getProductDescription(),
                        item.getProduct().getProductPrice(),
                        item.getProduct().getSkuProduct(),
                        item.getQuantity()
                ))
                .toList();
    }

    @Transactional
    public String updateWarehouseProduct(Long idInventory, UpdateWarehouseProductDTO dto, String currentUsername) {
        WarehouseProduct inventory = warehouseProductRepository.findById(idInventory)
                .orElseThrow(() -> new RuntimeException("Producto de sucursal no encontrado"));

        Warehouse warehouse = warehouseRepository
                .findByIdWarehouseAndUser_AuthUser_Username(
                        inventory.getWarehouse().getIdWarehouse(),
                        currentUsername
                )
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada o sin permisos"));

        if (!inventory.getWarehouse().getIdWarehouse().equals(warehouse.getIdWarehouse())) {
            throw new RuntimeException("No tienes permisos para modificar este inventario");
        }

        if (dto.getQuantity() == null || dto.getQuantity() < 0) {
            throw new RuntimeException("La cantidad debe ser un número mayor o igual a 0");
        }

        inventory.setQuantity(dto.getQuantity());
        warehouseProductRepository.save(inventory);

        return "Cantidad actualizada correctamente";
    }

    @Transactional
    public String deleteWarehouseProduct(Long idInventory, String currentUsername) {
        WarehouseProduct inventory = warehouseProductRepository.findById(idInventory)
                .orElseThrow(() -> new RuntimeException("Producto de sucursal no encontrado"));

        Warehouse warehouse = warehouseRepository
                .findByIdWarehouseAndUser_AuthUser_Username(
                        inventory.getWarehouse().getIdWarehouse(),
                        currentUsername
                )
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada o sin permisos"));

        if (!inventory.getWarehouse().getIdWarehouse().equals(warehouse.getIdWarehouse())) {
            throw new RuntimeException("No tienes permisos para eliminar este inventario");
        }

        warehouseProductRepository.delete(inventory);
        return "Producto eliminado de la sucursal correctamente";
    }
}