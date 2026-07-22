package com.ecommerce.api.services;

import com.ecommerce.api.dto.*;
import com.ecommerce.api.entities.Category;
import com.ecommerce.api.entities.Product;
import com.ecommerce.api.entities.Users;
import com.ecommerce.api.entities.Warehouse;
import com.ecommerce.api.entities.WarehouseProduct;
import com.ecommerce.api.repositories.CategoryRepository;
import com.ecommerce.api.repositories.ProductRepository;
import com.ecommerce.api.repositories.UsersRepository;
import com.ecommerce.api.repositories.WarehouseProductRepository;
import com.ecommerce.api.repositories.WarehouseRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private WarehouseProductRepository warehouseProductRepository;

    public ProductService(ProductRepository product){
        this.productRepository = product;
    }

    @Transactional
    public String publishProduct(ProductDTO productToPublish, String currentUsername){
        if(productToPublish.getProductPrice() <= 0){
            return "Error: El precio de publicacion debe ser mayor a 0";
        }

        if (productRepository.existsBySkuProduct(productToPublish.getSkuProduct())) {
            return "Error: El SKU ya existe";
        }

        Users owner = usersRepository.findByAuthUser_Username(currentUsername);
        Product product = new Product();
        product.setProductName(productToPublish.getProductName());
        product.setProductDescription(productToPublish.getProductDescription());
        product.setProductPrice(productToPublish.getProductPrice());
        product.setSkuProduct(productToPublish.getSkuProduct());
        product.setStock(productToPublish.getStock());
        product.setUser(owner);

        if (productToPublish.getId_category() != null) {
            Category category = categoryRepository.findById(productToPublish.getId_category())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            product.setCategory(category);
        }

        productRepository.save(product);
        return "Producto publicado";
    }

    public void applyCategoryDiscount(Long categoryId, int percentage) {
        productRepository.applyDiscount(categoryId, percentage);
    }

    @Transactional
    public List<CategoryOptionDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryOptionDTO(
                        c.getIdCategory(),
                        c.getCategoryName(),
                        c.getCategoryDescription(),
                        c.getIsHazardous()
                ))
                .toList();
    }

    @Transactional
    public String createCategory(CreateCategoryDTO dto) {
        if (dto.getCategoryName() == null || dto.getCategoryName().trim().isEmpty()) {
            throw new RuntimeException("El nombre de la categoría es obligatorio");
        }

        if (dto.getCategoryDescription() == null || dto.getCategoryDescription().trim().isEmpty()) {
            throw new RuntimeException("La descripción de la categoría es obligatoria");
        }

        if (categoryRepository.existsByCategoryNameIgnoreCase(dto.getCategoryName().trim())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }

        Category category = new Category();
        category.setCategoryName(dto.getCategoryName().trim());
        category.setCategoryDescription(dto.getCategoryDescription().trim());
        category.setIsHazardous(Boolean.TRUE.equals(dto.getIsHazardous()));

        categoryRepository.save(category);
        return "Categoría creada correctamente";
    }

    @Transactional
    public String createProductWithInventory(CreateProductWithInventoryDTO dto, String currentUsername) {
        validateProductData(dto.getProductName(), dto.getProductDescription(), dto.getProductPrice(), dto.getSkuProduct());

        if (productRepository.existsBySkuProduct(dto.getSkuProduct())) {
            throw new RuntimeException("El SKU ya existe");
        }

        Users owner = usersRepository.findByAuthUser_Username(currentUsername);
        if (owner == null) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Category category = resolveCategory(dto.getIdCategory(), dto.getCreateCategory(), dto.getNewCategory());
        List<ProductWarehouseStockDTO> validStocks = validateWarehouseStocks(dto.getWarehouseStocks(), currentUsername);

        Product product = new Product();
        product.setProductName(dto.getProductName().trim());
        product.setProductDescription(dto.getProductDescription().trim());
        product.setProductPrice(dto.getProductPrice());
        product.setSkuProduct(dto.getSkuProduct());
        product.setCategory(category);
        product.setUser(owner);

        long totalStock = validStocks.stream().mapToLong(ProductWarehouseStockDTO::getQuantity).sum();
        product.setStock((double) totalStock);

        Product savedProduct = productRepository.save(product);

        for (ProductWarehouseStockDTO stockDTO : validStocks) {
            Warehouse warehouse = warehouseRepository
                    .findByIdWarehouseAndUser_AuthUser_Username(stockDTO.getIdWarehouse(), currentUsername)
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada o sin permisos"));

            WarehouseProduct inventory = new WarehouseProduct();
            inventory.setWarehouse(warehouse);
            inventory.setProduct(savedProduct);
            inventory.setQuantity(stockDTO.getQuantity());
            warehouseProductRepository.save(inventory);
        }

        return "Producto creado correctamente";
    }

    @Transactional
    public List<MyProductResponseDTO> getMyProducts(String currentUsername) {
        List<Product> products = productRepository.findByUser_AuthUser_Username(currentUsername);

        return products.stream().map(product -> {
            List<WarehouseProduct> inventories =
                    warehouseProductRepository.findByProduct_IdProductAndWarehouse_User_AuthUser_Username(
                            product.getIdProduct(), currentUsername
                    );

            List<ProductInventoryItemDTO> inventoryItems = inventories.stream()
                    .map(item -> new ProductInventoryItemDTO(
                            item.getIdInventory(),
                            item.getWarehouse().getIdWarehouse(),
                            item.getWarehouse().getName(),
                            item.getQuantity()
                    ))
                    .toList();

            long totalStock = inventories.stream().mapToLong(WarehouseProduct::getQuantity).sum();

            return new MyProductResponseDTO(
                    product.getIdProduct(),
                    product.getProductName(),
                    product.getProductDescription(),
                    product.getProductPrice(),
                    product.getSkuProduct(),
                    product.getCategory() != null ? product.getCategory().getIdCategory() : null,
                    product.getCategory() != null ? product.getCategory().getCategoryName() : null,
                    product.getCategory() != null ? product.getCategory().getIsHazardous() : null,
                    totalStock,
                    inventoryItems
            );
        }).toList();
    }

    @Transactional
    public String updateProductWithInventory(Long idProduct, UpdateProductWithInventoryDTO dto, String currentUsername) {
        validateProductData(dto.getProductName(), dto.getProductDescription(), dto.getProductPrice(), dto.getSkuProduct());

        Product product = productRepository.findByIdProductAndUser_AuthUser_Username(idProduct, currentUsername)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o sin permisos"));

        if (productRepository.existsBySkuProductAndIdProductNot(dto.getSkuProduct(), idProduct)) {
            throw new RuntimeException("El SKU ya existe");
        }

        Category category = resolveCategory(dto.getIdCategory(), dto.getCreateCategory(), dto.getNewCategory());
        List<ProductWarehouseStockDTO> validStocks = validateWarehouseStocks(dto.getWarehouseStocks(), currentUsername);

        product.setProductName(dto.getProductName().trim());
        product.setProductDescription(dto.getProductDescription().trim());
        product.setProductPrice(dto.getProductPrice());
        product.setSkuProduct(dto.getSkuProduct());
        product.setCategory(category);

        warehouseProductRepository.deleteByProduct_IdProduct(product.getIdProduct());

        long totalStock = 0L;
        for (ProductWarehouseStockDTO stockDTO : validStocks) {
            Warehouse warehouse = warehouseRepository
                    .findByIdWarehouseAndUser_AuthUser_Username(stockDTO.getIdWarehouse(), currentUsername)
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada o sin permisos"));

            WarehouseProduct inventory = new WarehouseProduct();
            inventory.setWarehouse(warehouse);
            inventory.setProduct(product);
            inventory.setQuantity(stockDTO.getQuantity());
            warehouseProductRepository.save(inventory);

            totalStock += stockDTO.getQuantity();
        }

        product.setStock((double) totalStock);
        productRepository.save(product);

        return "Producto actualizado correctamente";
    }

    @Transactional
    public String deleteMyProduct(Long idProduct, String currentUsername) {
        Product product = productRepository.findByIdProductAndUser_AuthUser_Username(idProduct, currentUsername)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o sin permisos"));

        warehouseProductRepository.deleteByProduct_IdProduct(idProduct);
        productRepository.delete(product);

        return "Producto eliminado correctamente";
    }

    private void validateProductData(String name, String description, double price, Long sku) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("El nombre del producto es obligatorio");
        }
        if (name.trim().length() > 25) {
            throw new RuntimeException("El nombre del producto no puede superar 25 caracteres");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new RuntimeException("La descripción del producto es obligatoria");
        }
        if (description.trim().length() > 150) {
            throw new RuntimeException("La descripción no puede superar 150 caracteres");
        }
        if (price <= 0) {
            throw new RuntimeException("El precio debe ser mayor a 0");
        }
        if (sku == null || sku <= 0) {
            throw new RuntimeException("El SKU es obligatorio");
        }
    }

    private Category resolveCategory(Long idCategory, Boolean createCategory, CreateCategoryDTO newCategory) {
        if (Boolean.TRUE.equals(createCategory)) {
            if (newCategory == null) {
                throw new RuntimeException("Debes ingresar la información de la nueva categoría");
            }

            if (newCategory.getCategoryName() == null || newCategory.getCategoryName().trim().isEmpty()) {
                throw new RuntimeException("El nombre de la categoría es obligatorio");
            }

            if (newCategory.getCategoryDescription() == null || newCategory.getCategoryDescription().trim().isEmpty()) {
                throw new RuntimeException("La descripción de la categoría es obligatoria");
            }

            if (categoryRepository.existsByCategoryNameIgnoreCase(newCategory.getCategoryName().trim())) {
                return categoryRepository.findByCategoryNameIgnoreCase(newCategory.getCategoryName().trim())
                        .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            }

            Category category = new Category();
            category.setCategoryName(newCategory.getCategoryName().trim());
            category.setCategoryDescription(newCategory.getCategoryDescription().trim());
            category.setIsHazardous(Boolean.TRUE.equals(newCategory.getIsHazardous()));
            return categoryRepository.save(category);
        }

        if (idCategory == null) {
            throw new RuntimeException("Debes seleccionar una categoría");
        }

        return categoryRepository.findById(idCategory)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    private List<ProductWarehouseStockDTO> validateWarehouseStocks(List<ProductWarehouseStockDTO> warehouseStocks, String currentUsername) {
        if (warehouseStocks == null || warehouseStocks.isEmpty()) {
            throw new RuntimeException("Debes asignar el producto a al menos una sucursal");
        }

        Set<Long> usedWarehouses = new HashSet<>();
        List<ProductWarehouseStockDTO> validStocks = new ArrayList<>();

        for (ProductWarehouseStockDTO item : warehouseStocks) {
            if (item.getIdWarehouse() == null) {
                throw new RuntimeException("Debes seleccionar una sucursal");
            }

            if (item.getQuantity() == null || item.getQuantity() < 0) {
                throw new RuntimeException("La cantidad debe ser mayor o igual a 0");
            }

            warehouseRepository.findByIdWarehouseAndUser_AuthUser_Username(item.getIdWarehouse(), currentUsername)
                    .orElseThrow(() -> new RuntimeException("Una de las sucursales no existe o no te pertenece"));

            if (!usedWarehouses.add(item.getIdWarehouse())) {
                throw new RuntimeException("No puedes repetir sucursales en el inventario");
            }

            validStocks.add(item);
        }

        if (validStocks.stream().allMatch(x -> x.getQuantity() == 0)) {
            throw new RuntimeException("Debes ingresar stock mayor a 0 en al menos una sucursal");
        }

        return validStocks.stream()
                .filter(x -> x.getQuantity() > 0)
                .collect(Collectors.toList());
    }
}