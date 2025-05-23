package com.sondv.phone.dto;

import com.sondv.phone.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long id;
    private String name;
    private int productCount;

    public CategoryDTO(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.productCount = category.getProducts().size(); // OK vì đã có transaction
    }
}
