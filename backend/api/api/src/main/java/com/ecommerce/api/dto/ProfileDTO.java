package com.ecommerce.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {
    private Long idUser;
    private String username;
    private String email;
    private String name;
    private String rut;
    private String address;
    private String phone;
}
