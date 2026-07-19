package com.ecommerce.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "detail_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetailPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detail_payment") 
    private Long idDetailPayment;

    @Column(nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private Double subtotal;

    @ManyToOne
    @JoinColumn(name = "id_payment", nullable = false)
    private Payment payment;

    @ManyToOne
    @JoinColumn(name = "id_product", nullable = false)
    private Product product;
}