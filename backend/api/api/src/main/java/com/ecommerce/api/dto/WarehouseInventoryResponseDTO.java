package com.ecommerce.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseInventoryResponseDTO {
    private Long idInventory;
    private Long idWarehouse;
    private Long idProduct;
    private String productName;
    private String productDescription;
    private Double productPrice;
    private Long skuProduct;
    private Long quantity;
}