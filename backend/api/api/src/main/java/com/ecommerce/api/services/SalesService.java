package com.ecommerce.api.services;

import com.ecommerce.api.dto.PaymentDTO;
import com.ecommerce.api.dto.SalesDTO;
import com.ecommerce.api.repositories.SalesRepository;
import com.ecommerce.api.repositories.UsersRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalesService {

    @Autowired
    private UsersRepository userRepository;

    @Autowired
    private SalesRepository salesRepository;

    public SalesService(UsersRepository userRepository, SalesRepository salesRepository) {
        this.userRepository = userRepository;
        this.salesRepository = salesRepository;
    }

    public List<SalesDTO> getMySales() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Long idUser = userRepository.findIdByUsername(username);
        return salesRepository.findByUser(idUser);
    }

    public String checkout(Long idUser, String paymentMethod) {
        List<String> validMethods = List.of("CARD", "TRANSFER");
        if (!validMethods.contains(paymentMethod)) {
            throw new RuntimeException("Método de pago inválido: " + paymentMethod);
        }
        salesRepository.checkout(idUser, paymentMethod);
        return "Orden creada exitosamente";
    }

    public String approvePayment(Long idPayment) {
        String status = salesRepository.getPaymentStatus(idPayment);
        if (status == null || !status.equals("PENDING")) {
            throw new RuntimeException("Solo se pueden aprobar órdenes en estado PENDING");
        }
        salesRepository.approvePayment(idPayment);
        salesRepository.discountStockFromPayment(idPayment);
        return "Orden aprobada exitosamente";
    }

    public String cancelPayment(Long idPayment, Long idUser, boolean isAdmin) {
        String status = salesRepository.getPaymentStatus(idPayment);

        if (status == null) {
            throw new RuntimeException("Orden no encontrada");
        }
        if (status.equals("CANCELLED")) {
            throw new RuntimeException("La orden ya está cancelada");
        }
        if (!isAdmin) {
            Long owner = salesRepository.getPaymentOwner(idPayment);
            if (!owner.equals(idUser)) {
                throw new RuntimeException("No tienes permiso para cancelar esta orden");
            }
        }
        if (status.equals("APPROVED")) {
            salesRepository.restoreStock(idPayment);
        }

        salesRepository.cancelPayment(idPayment);
        return "Orden cancelada exitosamente";
    }

    public List<PaymentDTO> getPendingPayments() {
        return salesRepository.getPendingPayments();
    }

    public List<PaymentDTO> getMyPayments(Long idUser) {
        return salesRepository.getPaymentsByUser(idUser);
    }
}