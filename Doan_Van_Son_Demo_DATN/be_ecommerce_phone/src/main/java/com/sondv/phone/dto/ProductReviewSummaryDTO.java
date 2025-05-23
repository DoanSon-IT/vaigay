package com.sondv.phone.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductReviewSummaryDTO {
    private Double averageRating;
    private Long totalReviews;
    private List<ReviewResponse> reviews;
    private int currentPage;
    private int totalPages;
    private long totalElements;
}