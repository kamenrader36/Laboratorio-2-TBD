package com.ecommerce.api.entities;

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
@Table(name = "historial_stock")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistorial;

    @Column(nullable = false)
    private double amountModificated;

    @ManyToOne
    @JoinColumn(name = "id_user")
    private Users user;

    @ManyToOne
    @JoinColumn(name = "id_product")
    private Product product;
}
