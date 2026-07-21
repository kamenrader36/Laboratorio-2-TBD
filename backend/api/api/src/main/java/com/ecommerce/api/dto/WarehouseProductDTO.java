package com.ecommerce.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseProductDTO {
    private Long idWarehouse;
    private Long idProduct;
    private Long quantity;
}
