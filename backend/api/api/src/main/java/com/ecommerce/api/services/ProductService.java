package com.ecommerce.api.services;

import com.ecommerce.api.repositories.UsersRepository;
import jakarta.transaction.Transactional;
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
    @Autowired
    private UsersRepository usersRepository;

    public ProductService(ProductRepository product){
        this.productRepository = product;
    }

    @Transactional
    public String publishProduct(ProductDTO productToPublish, String currentUsername){

        if(productToPublish.getProductPrice() <= 0){
            return "Error: El precio de publicacion debe ser mayor a 0";
        }
        Users owner = usersRepository.findByAuthUser_Username(currentUsername);
        Product product = new Product();
        product.setProductName(productToPublish.getProductName());
        product.setProductDescription(productToPublish.getProductDescription());
        product.setProductPrice(productToPublish.getProductPrice());
        product.setSkuProduct(productToPublish.getSkuProduct());
        product.setStock(productToPublish.getStock());
        product.setUser(owner);
        productRepository.save(product);
        return "Producto publicado";
    }
    public void applyCategoryDiscount(Long categoryId, int percentage) {
        productRepository.applyDiscount(categoryId, percentage);
    }
}