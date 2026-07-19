package com.ecommerce.api.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.api.dto.ProductDTO;
import com.ecommerce.api.entities.Product;
import com.ecommerce.api.entities.Users;
import com.ecommerce.api.repositories.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public ProductService(ProductRepository product){
        this.productRepository = product;
    }

    public String publishProduct(ProductDTO productToPublish){
        
        if(productToPublish.getProductPrice() <= 0){
            return "Error: El precio de publicacion debe ser mayor a 0";
        }

        if(productToPublish.getId_user() == null){
            return "Error: El producto debe estar asociado a un usuario";
        }
        
        Product product = new Product();
        product.setProductName(productToPublish.getProductName());
        product.setProductDescription(productToPublish.getProductDescription());
        product.setProductPrice(productToPublish.getProductPrice());
        product.setSkuProduct(productToPublish.getSkuProduct());
        product.setStock(productToPublish.getStock());

        Users user = new Users();
        user.setIdUser(productToPublish.getId_user());
        product.setUser(user);
        
        productRepository.save(product);
        
        return "Producto publicado";
    }
}