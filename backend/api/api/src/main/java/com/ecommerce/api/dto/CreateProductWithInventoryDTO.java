package com.ecommerce.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateProductWithInventoryDTO {
    private String productName;
    private String productDescription;
    private double productPrice;
    private Long skuProduct;

    private Long idCategory;

    private Boolean createCategory;
    private CreateCategoryDTO newCategory;

    private List<ProductWarehouseStockDTO> warehouseStocks;
}