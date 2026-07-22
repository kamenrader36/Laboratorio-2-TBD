package com.ecommerce.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MyProductResponseDTO {
    private Long idProduct;
    private String productName;
    private String productDescription;
    private double productPrice;
    private Long skuProduct;
    private Long idCategory;
    private String categoryName;
    private Boolean hazardousCategory;
    private Long totalStock;
    private List<ProductInventoryItemDTO> inventories;
}