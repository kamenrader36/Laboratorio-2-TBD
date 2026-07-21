package com.ecommerce.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "warehouse_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInventory;

    @ManyToOne
    @JoinColumn(name = "id_warehouse")
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "id_product")
    private Product product;

    @Column(nullable = false)
    private Long quantity;
}
