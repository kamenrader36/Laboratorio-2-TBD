package com.ecommerce.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Polygon;

@Entity
@Table(name = "protected_zone")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProtectedZone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_zone")
    private Long idZone;

    @Column(name = "zone_name", nullable = false, length = 100)
    private String zoneName;

    @Column(columnDefinition = "geometry(Polygon, 4326)", nullable = false)
    private Polygon area;
}