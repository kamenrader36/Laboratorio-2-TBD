package com.ecommerce.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "store_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInventory;

    @ManyToOne
    @JoinColumn(name = "id_store")
    private Store store;

    @ManyToOne
    @JoinColumn(name = "id_product")
    private Product product;

    @Column(nullable = false)
    private Long quantity;
}
