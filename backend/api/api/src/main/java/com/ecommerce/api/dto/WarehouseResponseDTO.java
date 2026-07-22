package com.ecommerce.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseResponseDTO {
    private Long idWarehouse;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
}