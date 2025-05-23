package com.sondv.phone.service;

import com.sondv.phone.dto.*;
import com.sondv.phone.entity.*;
import com.sondv.phone.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final CloudinaryService cloudinaryService;
    private final PreloadCacheService preloadCacheService;

    // Lấy danh sách sản phẩm với phân trang
    @Cacheable(value = "products", key = "#searchKeyword + '-' + #pageable.pageNumber + '-' + #pageable.pageSize", unless = "#result == null || #result.isEmpty()")
    public Page<ProductDTO> getAllProducts(String searchKeyword, Pageable pageable) {
        Page<Product> productPage;
        if (searchKeyword != null && !searchKeyword.trim().isEmpty()) {
            productPage = productRepository.findByNameContainingIgnoreCase(searchKeyword.trim(), pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }
        return productPage.map(this::mapToDTOWithDiscountCheck);
    }

    // Lấy sản phẩm nổi bật
    @Cacheable(value = "featuredProducts")
    public List<ProductDTO> getFeaturedProducts() {
        List<Product> products = productRepository.findByIsFeaturedTrue();
        return products.stream().map(this::mapToDTOWithDiscountCheck).collect(Collectors.toList());
    }

    // Lấy sản phẩm mới nhất
    @Cacheable(value = "newestProducts", key = "#limit")
    public List<ProductDTO> getNewestProducts(int limit) {
        if (limit <= 0) {
            throw new IllegalArgumentException("Giới hạn phải lớn hơn 0");
        }
        List<Product> products = productRepository.findAllByOrderByIdDesc().stream()
                .limit(limit)
                .collect(Collectors.toList());
        return products.stream().map(this::mapToDTOWithDiscountCheck).collect(Collectors.toList());
    }

    // Lấy sản phẩm bán chạy
    @Cacheable(value = "bestSellingProducts", key = "#limit")
    public List<ProductDTO> getBestSellingProducts(int limit) {
        if (limit <= 0) {
            throw new IllegalArgumentException("Giới hạn phải lớn hơn 0");
        }
        List<Product> products = productRepository.findTop5ByOrderBySoldQuantityDesc().stream()
                .limit(limit)
                .collect(Collectors.toList());
        return products.stream().map(this::mapToDTOWithDiscountCheck).collect(Collectors.toList());
    }

    // Lấy sản phẩm theo ID
    @Cacheable(value = "product", key = "#id", unless = "#result == null")
    public Optional<ProductDTO> getProductById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID sản phẩm không hợp lệ");
        }
        return productRepository.findById(id).map(this::mapToDTOWithDiscountCheck);
    }

    // Lấy sản phẩm tương tự
    public List<ProductDTO> getRelatedProducts(Long productId, int limit) {
        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException("ID sản phẩm không hợp lệ");
        }
        if (limit <= 0) {
            throw new IllegalArgumentException("Giới hạn phải lớn hơn 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại với ID: " + productId));

        // Tính khoảng giá ±20%
        BigDecimal currentPrice = getCurrentPrice(product, LocalDateTime.now());
        BigDecimal minPrice = currentPrice.multiply(BigDecimal.valueOf(0.8));
        BigDecimal maxPrice = currentPrice.multiply(BigDecimal.valueOf(1.2));

        // Lấy sản phẩm tương tự
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> relatedProducts = productRepository.findRelatedProducts(
                product.getCategory().getId(),
                productId,
                minPrice,
                maxPrice,
                pageable
        );

        return relatedProducts.stream()
                .map(this::mapToDTOWithDiscountCheck)
                .collect(Collectors.toList());
    }

    public Page<ProductDTO> getFilteredProducts(String searchKeyword, BigDecimal minPrice, BigDecimal maxPrice, String sortBy, Pageable pageable) {
        List<Product> products;

        if (searchKeyword != null && !searchKeyword.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(searchKeyword.trim(), Pageable.unpaged()).getContent();
        } else {
            products = productRepository.findAll();
        }

        LocalDateTime now = LocalDateTime.now();
        if (minPrice != null || maxPrice != null) {
            products = products.stream()
                    .filter(p -> {
                        BigDecimal currentPrice = getCurrentPrice(p, now);
                        boolean matchesMin = minPrice == null || currentPrice.compareTo(minPrice) >= 0;
                        boolean matchesMax = maxPrice == null || currentPrice.compareTo(maxPrice) <= 0;
                        return matchesMin && matchesMax;
                    })
                    .collect(Collectors.toList());
        }

        switch (sortBy != null ? sortBy.toLowerCase() : "") {
            case "newest":
                products.sort((a, b) -> b.getId().compareTo(a.getId()));
                break;
            case "bestselling":
                products.sort((a, b) -> b.getSoldQuantity().compareTo(a.getSoldQuantity()));
                break;
            case "priceasc":
                products.sort((a, b) -> getCurrentPrice(a, now).compareTo(getCurrentPrice(b, now)));
                break;
            case "pricedesc":
                products.sort((a, b) -> getCurrentPrice(b, now).compareTo(getCurrentPrice(a, now)));
                break;
        }

        int start = (int) pageable.getOffset();
        if (start >= products.size()) {
            return new PageImpl<>(List.of(), pageable, products.size());
        }
        int end = Math.min(start + pageable.getPageSize(), products.size());

        List<ProductDTO> productDTOs = products.subList(start, end).stream()
                .map(this::mapToDTOWithDiscountCheck)
                .collect(Collectors.toList());

        return new PageImpl<>(productDTOs, pageable, products.size());
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDTO createProduct(Product product) {
        logger.info("Creating product: {}", product.getName());

        validateProduct(product);
        validateCategoryAndSupplier(product);

        Product savedProduct = productRepository.save(product);

        if (inventoryRepository.existsByProductId(savedProduct.getId())) {
            throw new IllegalStateException("Tồn kho đã tồn tại cho sản phẩm này");
        }

        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        int initialQuantity = product.getStock() != null ? product.getStock() : 0;
        inventory.setQuantity(initialQuantity);
        inventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inventory);
        savedProduct.setInventory(inventory);

        InventoryLog log = new InventoryLog();
        log.setProduct(savedProduct);
        log.setOldQuantity(0);
        log.setNewQuantity(initialQuantity);
        log.setReason("Khởi tạo sản phẩm");
        log.setUserId(1L);
        log.setTimestamp(LocalDateTime.now());
        inventoryLogRepository.save(log);

        saveProductImages(savedProduct, product.getImages());
        preloadCacheService.preloadProductCache();
        return mapToDTOWithDiscountCheck(savedProduct);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDTO updateProduct(Long id, Product updatedProduct) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID sản phẩm không hợp lệ");
        }

        return productRepository.findById(id).map(product -> {
            validateProduct(updatedProduct);
            validateCategoryAndSupplier(updatedProduct);

            product.setName(updatedProduct.getName());
            product.setDescription(updatedProduct.getDescription());
            product.setCostPrice(updatedProduct.getCostPrice());
            product.setSellingPrice(updatedProduct.getSellingPrice());
            product.setDiscountedPrice(updatedProduct.getDiscountedPrice());
            product.setDiscountStartDate(updatedProduct.getDiscountStartDate());
            product.setDiscountEndDate(updatedProduct.getDiscountEndDate());
            product.setFeatured(updatedProduct.isFeatured());

            if (updatedProduct.getStock() != null) {
                if (updatedProduct.getStock() < 0) {
                    throw new IllegalArgumentException("Tồn kho không được âm");
                }
                product.setStock(updatedProduct.getStock());
            }

            Product savedProduct = productRepository.save(product);

            Inventory inventory = inventoryRepository.findByProductId(id)
                    .orElseGet(() -> {
                        Inventory newInventory = new Inventory();
                        newInventory.setProduct(savedProduct);
                        return newInventory;
                    });

            int oldQuantity = inventory.getQuantity();
            int newQuantity = savedProduct.getStock() != null ? savedProduct.getStock() : 0;
            inventory.setQuantity(newQuantity);
            inventory.setLastUpdated(LocalDateTime.now());
            inventoryRepository.save(inventory);
            savedProduct.setInventory(inventory);

            if (oldQuantity != newQuantity) {
                InventoryLog log = new InventoryLog();
                log.setProduct(savedProduct);
                log.setOldQuantity(oldQuantity);
                log.setNewQuantity(newQuantity);
                log.setReason("Cập nhật sản phẩm");
                log.setUserId(1L);
                log.setTimestamp(LocalDateTime.now());
                inventoryLogRepository.save(log);
            }
            preloadCacheService.preloadProductCache();
            return mapToDTOWithDiscountCheck(savedProduct);
        }).orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại với ID: " + id));
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID sản phẩm không hợp lệ");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại với ID: " + id));

        productRepository.deleteById(id);
        preloadCacheService.preloadProductCache();
    }

    @Transactional
    public void applyDiscountToAll(BigDecimal percentage, BigDecimal fixedAmount, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (percentage == null && fixedAmount == null) {
            throw new IllegalArgumentException("Phải cung cấp ít nhất một giá trị giảm giá (phần trăm hoặc cố định)");
        }
        if (startDateTime == null || endDateTime == null || startDateTime.isAfter(endDateTime)) {
            throw new IllegalArgumentException("Thời gian giảm giá không hợp lệ");
        }

        logger.info("Áp dụng giảm giá cho tất cả sản phẩm: percentage={}, fixedAmount={}, startDateTime={}, endDateTime={}",
                percentage, fixedAmount, startDateTime, endDateTime);

        List<Product> products = productRepository.findAll();
        if (products == null || products.isEmpty()) {
            logger.warn("Không tìm thấy sản phẩm để áp dụng giảm giá");
            return;
        }

        for (Product product : products) {
            if (product.getSellingPrice() == null) {
                logger.error("Selling price is null for product: {}", product.getId());
                continue;
            }
            BigDecimal newPrice = calculateDiscount(product.getSellingPrice(), percentage, fixedAmount);
            logger.info("Giá giảm mới của {}: từ {} → {}", product.getName(), product.getSellingPrice(), newPrice);
            product.setDiscountedPrice(newPrice);
            product.setDiscountStartDate(startDateTime);
            product.setDiscountEndDate(endDateTime);
        }

        productRepository.saveAll(products);
        logger.info("Đã áp dụng giảm giá cho {} sản phẩm", products.size());
    }

    @Transactional
    public void applyDiscountToSelected(List<Long> productIds, BigDecimal percentage, BigDecimal fixedAmount, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (productIds == null || productIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách sản phẩm không được trống");
        }
        if (percentage == null && fixedAmount == null) {
            throw new IllegalArgumentException("Phải cung cấp ít nhất một giá trị giảm giá (phần trăm hoặc cố định)");
        }
        if (startDateTime == null || endDateTime == null || startDateTime.isAfter(endDateTime)) {
            throw new IllegalArgumentException("Thời gian giảm giá không hợp lệ");
        }

        List<Product> products = productRepository.findAllById(productIds);
        if (products.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy sản phẩm nào để áp dụng giảm giá");
        }

        for (Product product : products) {
            if (product.getSellingPrice() == null) {
                logger.warn("Selling price is null for product: {}", product.getId());
                continue;
            }
            BigDecimal newPrice = calculateDiscount(product.getSellingPrice(), percentage, fixedAmount);
            product.setDiscountedPrice(newPrice);
            product.setDiscountStartDate(startDateTime);
            product.setDiscountEndDate(endDateTime);
        }

        productRepository.saveAll(products);
    }

    @Transactional
    @Scheduled(cron = "0 * * * * *")
    public void clearExpiredDiscounts() {
        LocalDateTime now = LocalDateTime.now();
        List<Product> expiredProducts = productRepository.findByDiscountEndDateBefore(now);
        if (!expiredProducts.isEmpty()) {
            for (Product product : expiredProducts) {
                product.setDiscountedPrice(null);
                product.setDiscountStartDate(null);
                product.setDiscountEndDate(null);
            }
            productRepository.saveAll(expiredProducts);
            logger.info("Đã xóa giảm giá cho {} sản phẩm hết hạn", expiredProducts.size());
        }
    }

    @Transactional
    public ProductImageDTO addProductImage(Long productId, MultipartFile file) {
        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException("ID sản phẩm không hợp lệ");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File ảnh không được trống");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại với ID: " + productId));

        String imageUrl = cloudinaryService.uploadImageToCloudinary(file);
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new IllegalStateException("Không thể upload ảnh lên Cloudinary");
        }

        ProductImage productImage = new ProductImage();
        productImage.setImageUrl(imageUrl);
        productImage.setProduct(product);
        return mapProductImageToDTO(productImageRepository.save(productImage));
    }

    @Transactional
    public void deleteProductImage(Long imageId) {
        if (imageId == null || imageId <= 0) {
            throw new IllegalArgumentException("ID ảnh không hợp lệ");
        }

        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("Ảnh sản phẩm không tồn tại với ID: " + imageId));
        productImageRepository.delete(productImage);
    }

    private void validateProduct(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Thông tin sản phẩm không được trống");
        }
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên sản phẩm không được trống");
        }
        if (product.getCostPrice() == null || product.getCostPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá vốn phải lớn hơn 0");
        }
        if (product.getSellingPrice() == null || product.getSellingPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá bán phải lớn hơn 0");
        }
        if (product.getStock() != null && product.getStock() < 0) {
            throw new IllegalArgumentException("Tồn kho không được âm");
        }
        if (product.getSoldQuantity() != null && product.getSoldQuantity() < 0) {
            throw new IllegalArgumentException("Số lượng đã bán không được âm");
        }
    }

    private void validateCategoryAndSupplier(Product product) {
        if (product.getCategory() == null || product.getCategory().getId() == null) {
            throw new IllegalArgumentException("Danh mục là bắt buộc");
        }
        if (!categoryRepository.existsById(product.getCategory().getId())) {
            throw new IllegalArgumentException("Danh mục không tồn tại với ID: " + product.getCategory().getId());
        }
        if (product.getSupplier() == null || product.getSupplier().getId() == null) {
            throw new IllegalArgumentException("Nhà cung cấp là bắt buộc");
        }
        if (!supplierRepository.existsById(product.getSupplier().getId())) {
            throw new IllegalArgumentException("Nhà cung cấp không tồn tại với ID: " + product.getSupplier().getId());
        }
    }

    private BigDecimal calculateDiscount(BigDecimal originalPrice, BigDecimal percentage, BigDecimal fixedAmount) {
        if (originalPrice == null) {
            throw new IllegalArgumentException("Giá gốc không được trống");
        }

        BigDecimal discounted = originalPrice;

        if (percentage != null && percentage.compareTo(BigDecimal.ZERO) > 0) {
            discounted = originalPrice.multiply(BigDecimal.ONE.subtract(percentage.divide(BigDecimal.valueOf(100))));
        }

        if (fixedAmount != null && fixedAmount.compareTo(BigDecimal.ZERO) > 0) {
            discounted = discounted.subtract(fixedAmount);
        }

        return discounted.max(BigDecimal.ZERO);
    }

    private void saveProductImages(Product product, List<ProductImage> images) {
        if (images == null || images.isEmpty()) {
            logger.info("📸 Không có ảnh để lưu cho sản phẩm: {}", product.getName());
            return;
        }

        for (ProductImage image : images) {
            if (image.getImageUrl() != null && !image.getImageUrl().trim().isEmpty()) {
                image.setProduct(product);
                productImageRepository.save(image);
            } else {
                logger.warn("⚠ Bỏ qua ảnh vì thiếu URL: {}", image);
            }
        }
    }

    private ProductDTO mapToDTOWithDiscountCheck(Product product) {
        LocalDateTime now = LocalDateTime.now();
        BigDecimal currentPrice = getCurrentPrice(product, now);

        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .costPrice(product.getCostPrice())
                .sellingPrice(product.getSellingPrice())
                .discountedPrice(currentPrice.compareTo(product.getSellingPrice()) < 0 ? currentPrice : null)
                .discountStartDate(product.getDiscountStartDate())
                .discountEndDate(product.getDiscountEndDate())
                .isFeatured(product.isFeatured())
                .stock(product.getStock())
                .soldQuantity(product.getSoldQuantity())
                .rating(product.getRating())
                .ratingCount(product.getRatingCount())
                .category(mapCategoryToDTO(product.getCategory()))
                .supplier(mapSupplierToDTO(product.getSupplier()))
                .images(
                        Optional.ofNullable(product.getImages())
                                .orElse(List.of())
                                .stream()
                                .map(this::mapProductImageToDTO)
                                .collect(Collectors.toList())
                )
                .inventory(Optional.ofNullable(product.getInventory()).orElse(null))
                .inventoryLogs(
                        Optional.ofNullable(product.getInventoryLogs())
                                .orElse(List.of())
                )
                .build();
    }

    private BigDecimal getCurrentPrice(Product product, LocalDateTime now) {
        if (product.getDiscountedPrice() != null &&
                product.getDiscountStartDate() != null &&
                product.getDiscountEndDate() != null &&
                !now.isBefore(product.getDiscountStartDate()) &&
                !now.isAfter(product.getDiscountEndDate())) {
            return product.getDiscountedPrice();
        }
        return product.getSellingPrice();
    }

    private CategoryDTO mapCategoryToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .productCount(category.getProducts().size()) // ✅ đồng bộ chuẩn
                .build();
    }

    private SupplierDTO mapSupplierToDTO(Supplier supplier) {
        return SupplierDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .build();
    }

    private ProductImageDTO mapProductImageToDTO(ProductImage image) {
        return ProductImageDTO.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .build();
    }
}