package com.ecommerce.api.controllers;

import java.util.List;

import com.ecommerce.api.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.api.entities.Product;
import com.ecommerce.api.repositories.ProductRepository;
import com.ecommerce.api.services.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    public ProductController(ProductService product){
        this.productService = product;
    }

    @PostMapping("/publish")
    public ResponseEntity<?> publishAProduct(@RequestBody ProductDTO productToPublish, Authentication authentication){
        String currentUsername = authentication.getName();
        String response = productService.publishProduct(productToPublish, currentUsername);

        if(response.contains("Error")){
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword){
        List<Product> keywordProducts = productRepository.searchByKeyword(keyword);
        return ResponseEntity.ok(keywordProducts);
    }

    @PostMapping("/apply-discount")
    public ResponseEntity<?> applyMassiveDiscount(@RequestBody DiscountDTO discountDTO) {
        try {
            productService.applyCategoryDiscount(discountDTO.getIdCategory(), (int) discountDTO.getPercent());
            return ResponseEntity.ok("Descuento aplicado con éxito");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al procesar el descuento: " + e.getMessage());
        }
    }

    @GetMapping("/my-products")
    public ResponseEntity<List<MyProductResponseDTO>> getMyProducts(Authentication authentication) {
        String currentUsername = authentication.getName();
        return ResponseEntity.ok(productService.getMyProducts(currentUsername));
    }

    @PostMapping("/create-with-inventory")
    public ResponseEntity<?> createProductWithInventory(
            @RequestBody CreateProductWithInventoryDTO dto,
            Authentication authentication
    ) {
        try {
            String currentUsername = authentication.getName();
            return ResponseEntity.ok(productService.createProductWithInventory(dto, currentUsername));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{idProduct}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long idProduct,
            @RequestBody UpdateProductWithInventoryDTO dto,
            Authentication authentication
    ) {
        try {
            String currentUsername = authentication.getName();
            return ResponseEntity.ok(productService.updateProductWithInventory(idProduct, dto, currentUsername));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{idProduct}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long idProduct,
            Authentication authentication
    ) {
        try {
            String currentUsername = authentication.getName();
            return ResponseEntity.ok(productService.deleteMyProduct(idProduct, currentUsername));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryOptionDTO>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody CreateCategoryDTO dto) {
        try {
            return ResponseEntity.ok(productService.createCategory(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}