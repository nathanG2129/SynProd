package com.synprod.SynProd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "product_ingredients", indexes = {
    @Index(name = "idx_ingredient_product", columnList = "product_id"),
    @Index(name = "idx_ingredient_name", columnList = "ingredient_name"),
    @Index(name = "idx_ingredient_sort", columnList = "product_id, sort_order")
})
public class ProductIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotBlank(message = "Ingredient name is required")
    @Size(max = 100, message = "Ingredient name must be less than 100 characters")
    @Column(name = "ingredient_name", nullable = false)
    private String ingredientName;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit must be less than 20 characters")
    @Column(name = "unit", nullable = false)
    private String unit;

    @Size(max = 255, message = "Notes must be less than 255 characters")
    @Column(name = "notes")
    private String notes;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    // Constructors
    public ProductIngredient() {
    }

    public ProductIngredient(String ingredientName, Double quantity, String unit) {
        this.ingredientName = ingredientName;
        this.quantity = quantity;
        this.unit = unit;
    }

    public ProductIngredient(String ingredientName, Double quantity, String unit, String notes) {
        this.ingredientName = ingredientName;
        this.quantity = quantity;
        this.unit = unit;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProductIngredient)) return false;
        ProductIngredient that = (ProductIngredient) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
