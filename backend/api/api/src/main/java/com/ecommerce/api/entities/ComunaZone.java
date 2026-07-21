package com.ecommerce.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Polygon;

@Entity
@Table(name = "comuna_zone")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComunaZone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comuna")
    private Long idComuna;

    @Column(name = "comuna_name", nullable = false, length = 100)
    private String comunaName;

    @Column(columnDefinition = "geometry(Polygon, 4326)", nullable = false)
    private Polygon area;
}