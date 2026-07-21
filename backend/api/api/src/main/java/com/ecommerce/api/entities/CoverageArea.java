package com.ecommerce.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Polygon;

@Entity
@Table(name = "coberture_area")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoverageArea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_coberture")
    private Long idCoberture;

    @Column(name = "area_name", nullable = false, length = 100)
    private String areaName;

    @Column(columnDefinition = "geometry(Polygon, 4326)", nullable = false)
    private Polygon area;
}