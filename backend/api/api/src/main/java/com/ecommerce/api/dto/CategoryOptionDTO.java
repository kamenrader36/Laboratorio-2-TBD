package com.ecommerce.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryOptionDTO {
    private Long idCategory;
    private String categoryName;
    private String categoryDescription;
    private Boolean isHazardous;
}