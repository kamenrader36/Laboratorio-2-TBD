package com.ecommerce.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductInventoryItemDTO {
    private Long idInventory;
    private Long idWarehouse;
    private String warehouseName;
    private Long quantity;
}