package com.ecommerce.api.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProduct;

    @Column(nullable = false, length = 25)
    private String productName;

    @Column(nullable = false, length = 150)
    private String productDescription;

    @Column(nullable = false)
    private double productPrice;

    @Column(nullable = false, unique = true)
    private Long skuProduct;

    @Column(nullable = true)
    private Double stock;

    @ManyToOne
    @JoinColumn(name = "id_category")
    @JsonIgnore
    private Category category;

    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false)
    @JsonIgnore
    private Users user;
}