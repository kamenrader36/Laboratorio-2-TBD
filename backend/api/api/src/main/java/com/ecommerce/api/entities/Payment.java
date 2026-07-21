package com.ecommerce.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_payment")
    private Long idPayment;

    @Column(nullable = false)
    private Double total;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(nullable = false, length = 50)
    private String paymentMethod;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "id_warehouse")
    private Warehouse warehouse;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL)
    private List<DetailPayment> details;
}
