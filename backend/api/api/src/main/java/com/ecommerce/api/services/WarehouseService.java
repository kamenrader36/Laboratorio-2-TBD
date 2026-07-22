package com.ecommerce.api.services;

import com.ecommerce.api.dto.WarehouseDTO;
import com.ecommerce.api.dto.WarehouseResponseDTO;
import com.ecommerce.api.entities.Users;
import com.ecommerce.api.entities.Warehouse;
import com.ecommerce.api.repositories.UsersRepository;
import com.ecommerce.api.repositories.WarehouseProductRepository;
import com.ecommerce.api.repositories.WarehouseRepository;
import jakarta.transaction.Transactional;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private WarehouseProductRepository warehouseProductRepository;

    public String createWarehouse(WarehouseDTO warehouseDTO, String currentUsername) {
        Users owner = usersRepository.findByAuthUser_Username(currentUsername);

        Warehouse warehouse = new Warehouse();
        warehouse.setName(warehouseDTO.getName());
        warehouse.setAddress(warehouseDTO.getAddress());

        GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        Coordinate coordinate = new Coordinate(warehouseDTO.getLongitude(), warehouseDTO.getLatitude());
        Point location = geometryFactory.createPoint(coordinate);

        warehouse.setLocation(location);
        warehouse.setUser(owner);

        warehouseRepository.save(warehouse);

        return "Tienda registrada correctamente";
    }

    @Transactional
    public List<WarehouseResponseDTO> getMyWarehouses(String currentUsername) {
        List<Warehouse> warehouses = warehouseRepository.findByUser_AuthUser_Username(currentUsername);

        return warehouses.stream()
                .map(w -> new WarehouseResponseDTO(
                        w.getIdWarehouse(),
                        w.getName(),
                        w.getAddress(),
                        w.getLocation() != null ? w.getLocation().getY() : null,
                        w.getLocation() != null ? w.getLocation().getX() : null
                ))
                .toList();
    }

    @Transactional
    public String updateWarehouse(Long idWarehouse, WarehouseDTO warehouseDTO, String currentUsername) {
        Warehouse warehouse = warehouseRepository.findByIdWarehouseAndUser_AuthUser_Username(idWarehouse, currentUsername)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada o sin permisos"));

        warehouse.setName(warehouseDTO.getName());
        warehouse.setAddress(warehouseDTO.getAddress());

        GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        Coordinate coordinate = new Coordinate(warehouseDTO.getLongitude(), warehouseDTO.getLatitude());
        Point location = geometryFactory.createPoint(coordinate);

        warehouse.setLocation(location);
        warehouseRepository.save(warehouse);

        return "Sucursal actualizada correctamente";
    }

    @Transactional
    public String deleteWarehouse(Long idWarehouse, String currentUsername) {
        Warehouse warehouse = warehouseRepository.findByIdWarehouseAndUser_AuthUser_Username(idWarehouse, currentUsername)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada o sin permisos"));

        boolean hasProducts = warehouseProductRepository.existsByWarehouse_IdWarehouse(idWarehouse);
        if (hasProducts) {
            throw new RuntimeException("No se puede eliminar la sucursal porque tiene productos asociados");
        }

        warehouseRepository.delete(warehouse);
        return "Sucursal eliminada correctamente";
    }
}