package com.sondv.phone.controller;

import com.sondv.phone.dto.PaymentRequest;
import com.sondv.phone.dto.PaymentUpdateRequest;
import com.sondv.phone.entity.*;
import com.sondv.phone.service.MomoService;
import com.sondv.phone.service.NotificationService;
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
    private final NotificationService notificationService;

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PostMapping
    public ResponseEntity<Map<String, String>> createPayment(@RequestBody PaymentRequest paymentRequest,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Chưa đăng nhập!");
                return ResponseEntity.status(401).body(errorResponse);
            }

            User user = (User) authentication.getPrincipal();
            Order order = paymentService.getOrderById(paymentRequest.getOrderId());

            if (!order.getCustomer().getUser().getId().equals(user.getId())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Bạn không có quyền tạo thanh toán cho đơn hàng này!");
                return ResponseEntity.status(403).body(errorResponse);
            }

            Payment payment = paymentService.createPayment(order.getId(), paymentRequest.getMethod());
            String paymentUrl = "";

            PaymentMethod method = paymentRequest.getMethod();
            if (method == PaymentMethod.VNPAY) {
                paymentUrl = vnPayService.createVNPayPayment(order.getId(), order.getTotalPrice().doubleValue());
            } else if (method == PaymentMethod.MOMO) {
                paymentUrl = momoService.createMomoPayment(order.getId(), order.getTotalPrice().doubleValue());
            } else if (method == PaymentMethod.COD) {
                paymentService.updatePaymentStatus(order.getId(), PaymentStatus.AWAITING_DELIVERY, null);
                paymentUrl = "/order-confirmation";
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Phương thức thanh toán không hợp lệ!");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi không xác định: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
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
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("message", "Không tìm thấy người dùng với email: " + email));
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
            return ResponseEntity.status(500).body(Collections.singletonMap("message",
                    "Lỗi dữ liệu: Không thể truy cập thông tin khách hàng của đơn hàng!"));
        }

        boolean isAdmin = user.getRoles().contains(RoleName.ADMIN);

        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(403)
                    .body(Collections.singletonMap("message", "Bạn không có quyền truy cập thanh toán này!"));
        }

        return ResponseEntity.ok(payment);
    }

    // Lấy URL thanh toán cho đơn hàng
    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/url/{orderId}")
    public ResponseEntity<Map<String, String>> getPaymentUrl(@PathVariable Long orderId,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Chưa đăng nhập!");
                return ResponseEntity.status(401).body(errorResponse);
            }

            User user = (User) authentication.getPrincipal();
            Order order = paymentService.getOrderById(orderId);

            if (!order.getCustomer().getUser().getId().equals(user.getId())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Bạn không có quyền truy cập đơn hàng này!");
                return ResponseEntity.status(403).body(errorResponse);
            }

            Payment payment = paymentService.getPaymentByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán!"));

            String paymentUrl = "";
            PaymentMethod method = payment.getPaymentMethod();

            if (method == PaymentMethod.VNPAY) {
                paymentUrl = vnPayService.createVNPayPayment(order.getId(), order.getTotalPrice().doubleValue());
            } else if (method == PaymentMethod.MOMO) {
                paymentUrl = momoService.createMomoPayment(order.getId(), order.getTotalPrice().doubleValue());
            } else if (method == PaymentMethod.COD) {
                paymentUrl = "/order-confirmation";
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Phương thức thanh toán không hợp lệ!");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi không xác định: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
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
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Callback endpoint cho VNPay
    @GetMapping("/vnpay/callback")
    public ResponseEntity<Map<String, String>> vnpayCallback(@RequestParam Map<String, String> params) {
        try {
            // Log để debug
            System.out.println("VNPay callback params: " + params);

            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TxnRef = params.get("vnp_TxnRef"); // orderId
            String vnp_TransactionNo = params.get("vnp_TransactionNo");

            if ("00".equals(vnp_ResponseCode)) {
                // Thanh toán thành công
                Long orderId = Long.parseLong(vnp_TxnRef);
                Payment updatedPayment = paymentService.updatePaymentStatus(orderId, PaymentStatus.PAID,
                        vnp_TransactionNo);

                // ✅ THÔNG BÁO ADMIN KHI THANH TOÁN THÀNH CÔNG
                try {
                    Order order = updatedPayment.getOrder();
                    String adminMessage = String.format(
                            "🎉 THANH TOÁN THÀNH CÔNG!\n" +
                                    "📦 Đơn hàng: #%d\n" +
                                    "👤 Khách hàng: %s\n" +
                                    "💰 Số tiền: %,.0f VND\n" +
                                    "🏦 Mã giao dịch VNPay: %s\n" +
                                    "⏰ Thời gian: %s",
                            orderId,
                            order.getCustomer().getFullName(),
                            order.getTotalPrice().doubleValue(),
                            vnp_TransactionNo,
                            java.time.LocalDateTime.now()
                                    .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

                    System.out.println(adminMessage); // Console log
                    notificationService.sendPaymentSuccessNotification(orderId, vnp_TransactionNo,
                            order.getTotalPrice().doubleValue());
                } catch (Exception e) {
                    System.err.println("❌ Lỗi gửi thông báo admin: " + e.getMessage());
                }

                Map<String, String> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Thanh toán thành công");
                return ResponseEntity.ok(response);
            } else {
                // Thanh toán thất bại
                Long orderId = Long.parseLong(vnp_TxnRef);
                paymentService.updatePaymentStatus(orderId, PaymentStatus.FAILED, null);

                Map<String, String> response = new HashMap<>();
                response.put("status", "failed");
                response.put("message", "Thanh toán thất bại");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Lỗi xử lý callback: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Callback endpoint cho MoMo
    @PostMapping("/momo/callback")
    public ResponseEntity<Map<String, String>> momoCallback(@RequestBody Map<String, Object> params) {
        try {
            // Log để debug
            System.out.println("MoMo callback params: " + params);

            String resultCode = String.valueOf(params.get("resultCode"));
            String orderId = String.valueOf(params.get("orderId"));
            String transId = String.valueOf(params.get("transId"));

            if ("0".equals(resultCode)) {
                // Thanh toán thành công
                paymentService.updatePaymentStatus(Long.parseLong(orderId), PaymentStatus.PAID, transId);

                Map<String, String> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Thanh toán thành công");
                return ResponseEntity.ok(response);
            } else {
                // Thanh toán thất bại
                paymentService.updatePaymentStatus(Long.parseLong(orderId), PaymentStatus.FAILED, null);

                Map<String, String> response = new HashMap<>();
                response.put("status", "failed");
                response.put("message", "Thanh toán thất bại");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Lỗi xử lý callback: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}