package com.synprod.SynProd.dto;

import com.synprod.SynProd.entity.Product;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ProductDto {

    private Long id;
    private String name;
    private String description;
    private Double baseWeight;
    private String baseWeightUnit;
    private List<ProductCompositionDto> compositions;
    private List<ProductIngredientDto> additionalIngredients;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;

    // Constructors
    public ProductDto() {
    }

    public ProductDto(Long id, String name, String description, Double baseWeight, String baseWeightUnit) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.baseWeight = baseWeight;
        this.baseWeightUnit = baseWeightUnit;
    }

    // Static factory method
    public static ProductDto fromEntity(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setBaseWeight(product.getBaseWeight());
        dto.setBaseWeightUnit(product.getBaseWeightUnit());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        
        if (product.getCreatedBy() != null) {
            dto.setCreatedByName(product.getCreatedBy().getFullName());
        }

        // Convert compositions
        if (product.getCompositions() != null) {
            dto.setCompositions(
                product.getCompositions().stream()
                    .map(ProductCompositionDto::fromEntity)
                    .collect(Collectors.toList())
            );
        }

        // Convert additional ingredients
        if (product.getAdditionalIngredients() != null) {
            dto.setAdditionalIngredients(
                product.getAdditionalIngredients().stream()
                    .map(ProductIngredientDto::fromEntity)
                    .collect(Collectors.toList())
            );
        }

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getBaseWeight() {
        return baseWeight;
    }

    public void setBaseWeight(Double baseWeight) {
        this.baseWeight = baseWeight;
    }

    public String getBaseWeightUnit() {
        return baseWeightUnit;
    }

    public void setBaseWeightUnit(String baseWeightUnit) {
        this.baseWeightUnit = baseWeightUnit;
    }

    public List<ProductCompositionDto> getCompositions() {
        return compositions;
    }

    public void setCompositions(List<ProductCompositionDto> compositions) {
        this.compositions = compositions;
    }

    public List<ProductIngredientDto> getAdditionalIngredients() {
        return additionalIngredients;
    }

    public void setAdditionalIngredients(List<ProductIngredientDto> additionalIngredients) {
        this.additionalIngredients = additionalIngredients;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    // Helper methods
    public Double getTotalCompositionPercentage() {
        if (compositions == null || compositions.isEmpty()) {
            return 0.0;
        }
        return compositions.stream()
                .mapToDouble(ProductCompositionDto::getPercentage)
                .sum();
    }
}
