package com.synprod.SynProd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_name", columnList = "name"),
    @Index(name = "idx_product_type", columnList = "product_type"),
    @Index(name = "idx_product_created_by", columnList = "created_by"),
    @Index(name = "idx_product_created_at", columnList = "created_at")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name must be less than 100 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    @Column(name = "description")
    private String description;

    @NotNull(message = "Product type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType productType;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<ProductComposition> compositions = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<ProductIngredient> additionalIngredients = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Product() {
    }

    public Product(String name, String description, ProductType productType) {
        this.name = name;
        this.description = description;
        this.productType = productType;
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

    public ProductType getProductType() {
        return productType;
    }

    public void setProductType(ProductType productType) {
        this.productType = productType;
    }

    // Convenience methods for base weight information
    public Double getBaseWeight() {
        return productType != null ? productType.getBaseWeight() : null;
    }

    public String getBaseWeightUnit() {
        return productType != null ? productType.getBaseWeightUnit() : null;
    }

    public String getBaseWeightDisplay() {
        return productType != null ? productType.getBaseWeightDisplay() : null;
    }

    public List<ProductComposition> getCompositions() {
        return compositions;
    }

    public void setCompositions(List<ProductComposition> compositions) {
        this.compositions = compositions;
    }

    public List<ProductIngredient> getAdditionalIngredients() {
        return additionalIngredients;
    }

    public void setAdditionalIngredients(List<ProductIngredient> additionalIngredients) {
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

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    // Helper methods
    public void addComposition(ProductComposition composition) {
        compositions.add(composition);
        composition.setProduct(this);
    }

    public void removeComposition(ProductComposition composition) {
        compositions.remove(composition);
        composition.setProduct(null);
    }

    public void addIngredient(ProductIngredient ingredient) {
        additionalIngredients.add(ingredient);
        ingredient.setProduct(this);
    }

    public void removeIngredient(ProductIngredient ingredient) {
        additionalIngredients.remove(ingredient);
        ingredient.setProduct(null);
    }

    // Calculate total composition percentage
    public Double getTotalCompositionPercentage() {
        return compositions.stream()
                .mapToDouble(ProductComposition::getPercentage)
                .sum();
    }
}
