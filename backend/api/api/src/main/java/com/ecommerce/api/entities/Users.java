package com.ecommerce.api.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUser;
    
    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 12)
    private String rut;

    @Column(nullable = false, length = 30)
    private String address;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(nullable = true)
    private LocalDateTime lastPurchase;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location;
    @OneToOne
    @JoinColumn(name = "id_auth")
    private AuthUser authUser;
}
