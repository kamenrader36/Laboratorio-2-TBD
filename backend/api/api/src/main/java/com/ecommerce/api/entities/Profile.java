package com.ecommerce.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_profile")
    private Long idProfile;

    @Column(nullable = false, length = 30)
    private String username;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 100)
    private String name;

    @Column(length = 15)
    private String rut;

    @Column(length = 200)
    private String address;

    @Column(length = 20)
    private String phone;

    @OneToOne
    @JoinColumn(name = "id_user", nullable = false)
    private Users user;

}