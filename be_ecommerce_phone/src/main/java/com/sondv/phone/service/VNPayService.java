package com.sondv.phone.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayService {

    @Value("${VNPAY_TMN_CODE}")
    private String vnpTmnCode;

    @Value("${VNPAY_HASH_SECRET}")
    private String vnpHashSecret;

    @Value("${VNPAY_PAY_URL}")
    private String vnpPayUrl;

    @Value("${VNPAY_RETURN_URL}")
    private String vnpReturnUrl;

    @Value("${VNPAY_IPN_URL:}")
    private String vnpIpnUrl;

    @Value("${VNPAY_VERSION}")
    private String vnpVersion;

    public String createVNPayPayment(Long orderId, Double amount) {
        try {
            // 1. Chuẩn bị các giá trị
            String vnp_TxnRef = orderId.toString();
            String vnp_OrderInfo = "Thanh toán đơn hàng #" + orderId;
            String vnp_Amount = String.valueOf((long) (amount * 100)); // VNPay yêu cầu nhân 100
            String vnp_Locale = "vn";
            String vnp_Command = "pay";
            String vnp_CurrCode = "VND";
            String vnp_IpAddr = "127.0.0.1";

            // Format thời gian đúng chuẩn: yyyyMMddHHmmss
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(new Date());

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnpVersion);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnpTmnCode);
            vnp_Params.put("vnp_Amount", vnp_Amount);
            vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", vnp_Locale);
            vnp_Params.put("vnp_ReturnUrl", vnpReturnUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            // Tạm thời bỏ IPN URL vì VNPay sandbox có thể không hỗ trợ localhost
            // if (vnpIpnUrl != null && !vnpIpnUrl.isEmpty()) {
            // vnp_Params.put("vnp_IpnUrl", vnpIpnUrl);
            // }

            // 2. Sắp xếp và tạo chuỗi query + chuỗi hash
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            for (String fieldName : fieldNames) {
                String value = vnp_Params.get(fieldName);
                if (value != null && !value.isEmpty()) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII))
                            .append('&');
                    query.append(fieldName).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII))
                            .append('&');
                }
            }

            // Bỏ dấu `&` cuối cùng
            if (hashData.length() > 0) {
                hashData.setLength(hashData.length() - 1);
            }
            if (query.length() > 0) {
                query.setLength(query.length() - 1);
            }

            // 3. Tạo secure hash
            String secureHash = hmacSHA512(vnpHashSecret, hashData.toString());

            // 4. Hoàn thiện URL
            query.append("&vnp_SecureHash=").append(secureHash);
            String finalUrl = vnpPayUrl + "?" + query.toString();

            // Log để debug
            System.out.println("🔗 VNPay URL được tạo: " + finalUrl);
            System.out.println("📋 VNPay Parameters:");
            vnp_Params.forEach((key, value) -> System.out.println("  " + key + " = " + value));
            System.out.println("🔐 Secure Hash: " + secureHash);

            return finalUrl;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo URL thanh toán VNPay: " + e.getMessage(), e);
        }
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac hmac512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac512.init(secretKey);
        byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hash = new StringBuilder();
        for (byte b : bytes) {
            hash.append(String.format("%02x", b));
        }
        return hash.toString();
    }
}
