package com.ecommerce.api.services;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.api.dto.CartPurchaseDTO;
import com.ecommerce.api.entities.CartDetail;
import com.ecommerce.api.entities.Product;
import com.ecommerce.api.entities.ShoppingCart;
import com.ecommerce.api.entities.Users;
import com.ecommerce.api.repositories.CartDetailRepository;
import com.ecommerce.api.repositories.ProductRepository;
import com.ecommerce.api.repositories.ShoppingCartRepository;

@Service
public class ShoppingCartServices {

    @Autowired
    private ShoppingCartRepository shoppingCartRepository;

    @Autowired
    private CartDetailRepository cartDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    public String addProductToCart(CartPurchaseDTO purchase){
        
        Optional<Product> product = productRepository.findById(purchase.getId_product());

        if(product.isEmpty()){
            return "Error: Producto no encontrado";
        }

        Product realProduct = product.get();

        if(realProduct.getStock() < purchase.getQuantity()){
            return "Error: no hay stock suficiente";
        }

        Optional<ShoppingCart> cart = shoppingCartRepository.findByUser_IdUser(purchase.getId_user());
        ShoppingCart shoppingCart;
        
        if(cart.isPresent()){
            shoppingCart = cart.get();
        } else {
            shoppingCart = new ShoppingCart();
            Users user = new Users();
            user.setIdUser(purchase.getId_user());
            shoppingCart.setUser(user);
            shoppingCart = shoppingCartRepository.save(shoppingCart);
        }

        CartDetail cartDetail = new CartDetail();
        cartDetail.setShoppingCart(shoppingCart);
        cartDetail.setProduct(realProduct);
        cartDetail.setQuantity(purchase.getQuantity());
        
        cartDetailRepository.save(cartDetail);
        return "Producto agregado al carrito con exito";
    }

    public Optional<ShoppingCart> getCartByUserId(Long idUser) {
        return shoppingCartRepository.findByUser_IdUser(idUser);
    }
}