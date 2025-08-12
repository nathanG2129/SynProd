package com.synprod.SynProd.dto;

import com.synprod.SynProd.entity.ProductIngredient;

public class ProductIngredientDto {

    private Long id;
    private String ingredientName;
    private Double quantity;
    private String unit;
    private String notes;
    private Integer sortOrder;

    // Constructors
    public ProductIngredientDto() {
    }

    public ProductIngredientDto(String ingredientName, Double quantity, String unit) {
        this.ingredientName = ingredientName;
        this.quantity = quantity;
        this.unit = unit;
    }

    public ProductIngredientDto(String ingredientName, Double quantity, String unit, String notes) {
        this.ingredientName = ingredientName;
        this.quantity = quantity;
        this.unit = unit;
        this.notes = notes;
    }

    // Static factory method
    public static ProductIngredientDto fromEntity(ProductIngredient ingredient) {
        ProductIngredientDto dto = new ProductIngredientDto();
        dto.setId(ingredient.getId());
        dto.setIngredientName(ingredient.getIngredientName());
        dto.setQuantity(ingredient.getQuantity());
        dto.setUnit(ingredient.getUnit());
        dto.setNotes(ingredient.getNotes());
        dto.setSortOrder(ingredient.getSortOrder());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIngredientName() {
        return ingredientName;
    }

    public void setIngredientName(String ingredientName) {
        this.ingredientName = ingredientName;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    // Helper method for display
    public String getDisplayText() {
        return String.format("%.2f %s %s", quantity, unit, ingredientName);
    }
}
