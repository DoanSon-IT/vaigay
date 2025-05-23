package com.sondv.phone.dto;

import com.sondv.phone.entity.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentUpdateRequest {
    private PaymentStatus status;
    private String transactionId;
}
