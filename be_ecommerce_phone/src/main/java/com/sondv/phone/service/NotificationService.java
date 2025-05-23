package com.sondv.phone.service;

import com.sondv.phone.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final JavaMailSender mailSender;
    private static final Logger logger = Logger.getLogger(NotificationService.class.getName());

    // ✅ Gửi thông báo khi tồn kho thấp
    public void sendLowStockAlert(Product product, int quantity) {
        String message = "⚠️ CẢNH BÁO: Sản phẩm '" + product.getName() + "' chỉ còn " + quantity + " trong kho!";
        logger.warning(message); // ✅ Ghi log cảnh báo

        // ✅ Gửi email cho Admin
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo("admin@example.com");
        mail.setSubject("Cảnh Báo Tồn Kho Thấp");
        mail.setText(message);
        mailSender.send(mail);
    }

    // ✅ Gửi thông báo khi thanh toán thành công
    public void sendPaymentSuccessNotification(Long orderId, String transactionId, double amount) {
        String message = String.format(
                "🎉 THANH TOÁN THÀNH CÔNG!\n" +
                        "📦 Đơn hàng: #%d\n" +
                        "💰 Số tiền: %,.0f VND\n" +
                        "🏦 Mã giao dịch: %s\n" +
                        "⏰ Thời gian: %s",
                orderId,
                amount,
                transactionId,
                java.time.LocalDateTime.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

        logger.info(message); // ✅ Ghi log thông báo

        try {
            // ✅ Gửi email cho Admin
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo("admin@example.com");
            mail.setSubject("🎉 Thông Báo Thanh Toán Thành Công - Đơn Hàng #" + orderId);
            mail.setText(message);
            mailSender.send(mail);
            logger.info("✅ Đã gửi email thông báo thanh toán thành công cho admin");
        } catch (Exception e) {
            logger.warning("⚠️ Không thể gửi email thông báo: " + e.getMessage());
        }
    }
}
