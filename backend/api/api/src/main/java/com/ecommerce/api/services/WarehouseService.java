package com.ecommerce.api.services;

import com.ecommerce.api.dto.WarehouseDTO;
import com.ecommerce.api.entities.Users;
import com.ecommerce.api.entities.Warehouse;
import com.ecommerce.api.repositories.UsersRepository;
import com.ecommerce.api.repositories.WarehouseRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WarehouseService {
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private UsersRepository usersRepository;

    public String createWarehouse(WarehouseDTO warehouseDTO, String currentUsername){
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
}
