package com.ecommerce.api.services;

import com.ecommerce.api.dto.StoreDTO;
import com.ecommerce.api.entities.Store;
import com.ecommerce.api.repositories.StoreRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StoreService {
    @Autowired
    private StoreRepository storeRepository;

    public String createStore(StoreDTO storeDTO){
        Store store = new Store();
        store.setName(storeDTO.getName());
        store.setAddress(storeDTO.getAddress());
        GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        Coordinate coordinate = new Coordinate(storeDTO.getLatitude(), storeDTO.getLongitude());
        Point location = geometryFactory.createPoint(coordinate);
        store.setLocation(location);
        storeRepository.save(store);
        return "Tienda registrada correctamente";
    }
}
