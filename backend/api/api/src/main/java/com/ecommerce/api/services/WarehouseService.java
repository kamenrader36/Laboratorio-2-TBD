package com.ecommerce.api.services;

import com.ecommerce.api.dto.StoreDTO;
import com.ecommerce.api.entities.Warehouse;
import com.ecommerce.api.repositories.WharehouseRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WarehouseService {
    @Autowired
    private WharehouseRepository wharehouseRepository;

    public String createStore(StoreDTO storeDTO){
        Warehouse warehouse = new Warehouse();
        warehouse.setName(storeDTO.getName());
        warehouse.setAddress(storeDTO.getAddress());
        GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        Coordinate coordinate = new Coordinate(storeDTO.getLatitude(), storeDTO.getLongitude());
        Point location = geometryFactory.createPoint(coordinate);
        warehouse.setLocation(location);
        wharehouseRepository.save(warehouse);
        return "Tienda registrada correctamente";
    }
}
