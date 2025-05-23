package com.sondv.phone.controller;

import com.sondv.phone.dto.PaymentRequest;
import com.sondv.phone.dto.PaymentUpdateRequest;
import com.sondv.phone.entity.*;
import com.sondv.phone.service.MomoService;
import com.sondv.phone.service.PaymentService;
import com.sondv.phone.service.VNPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final VNPayService vnPayService;
    private final MomoService momoService;

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PostMapping
    public ResponseEntity<Map<String, String>> createPayment(@RequestBody PaymentRequest paymentRequest, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.singletonMap("message", "Chưa đăng nhập!"));
        }
        User user = (User) authentication.getPrincipal();
        Order order = paymentService.getOrderById(paymentRequest.getOrderId());

        if (!order.getCustomer().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Collections.singletonMap("message", "Bạn không có quyền tạo thanh toán cho đơn hàng này!"));
        }

        Payment payment = paymentService.createPayment(order.getId(), paymentRequest.getMethod());
        String paymentUrl = "";

        switch (paymentRequest.getMethod()) {
            case VNPAY:
                paymentUrl = vnPayService.createVNPayPayment(payment.getId(), order.getTotalPrice().doubleValue());
                break;
            case MOMO:
                paymentUrl = momoService.createMomoPayment(payment.getId(), order.getTotalPrice().doubleValue());
                break;
            case COD:
                paymentService.updatePaymentStatus(order.getId(), PaymentStatus.AWAITING_DELIVERY, null);
                paymentUrl = "/order-confirmation";
                break;
            default:
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Phương thức thanh toán không hợp lệ!"));
        }

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('CUSTOMER') or hasAuthority('ADMIN')")
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getPayment(@PathVariable Long orderId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.singletonMap("message", "Chưa đăng nhập!"));
        }

        String email = authentication.getName();
        System.out.println("Email from authentication: " + email); // Log để debug
        User user = paymentService.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body(Collections.singletonMap("message", "Không tìm thấy người dùng với email: " + email));
        }

        Payment payment;
        try {
            payment = paymentService.getPaymentByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Collections.singletonMap("message", e.getMessage()));
        }

        boolean isOwner;
        try {
            isOwner = payment.getOrder().getCustomer().getUser().getEmail().equals(email);
        } catch (NullPointerException e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("message", "Lỗi dữ liệu: Không thể truy cập thông tin khách hàng của đơn hàng!"));
        }

        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.equals("ADMIN"));

        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(403).body(Collections.singletonMap("message", "Bạn không có quyền truy cập thanh toán này!"));
        }

        return ResponseEntity.ok(payment);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{orderId}")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long orderId,
                                                 @RequestBody PaymentUpdateRequest paymentUpdateRequest) {
        try {
            Payment updatedPayment = paymentService.updatePaymentStatus(
                    orderId,
                    paymentUpdateRequest.getStatus(),
                    paymentUpdateRequest.getTransactionId());
            return ResponseEntity.ok(updatedPayment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}