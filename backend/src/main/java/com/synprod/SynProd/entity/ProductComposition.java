package com.synprod.SynProd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "product_compositions")
public class ProductComposition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotBlank(message = "Component name is required")
    @Size(max = 100, message = "Component name must be less than 100 characters")
    @Column(name = "component_name", nullable = false)
    private String componentName;

    @NotNull(message = "Percentage is required")
    @Min(value = 0, message = "Percentage must be at least 0")
    @Max(value = 100, message = "Percentage cannot exceed 100")
    @Column(name = "percentage", nullable = false)
    private Double percentage;

    @Size(max = 255, message = "Notes must be less than 255 characters")
    @Column(name = "notes")
    private String notes;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    // Constructors
    public ProductComposition() {
    }

    public ProductComposition(String componentName, Double percentage) {
        this.componentName = componentName;
        this.percentage = percentage;
    }

    public ProductComposition(String componentName, Double percentage, String notes) {
        this.componentName = componentName;
        this.percentage = percentage;
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

    public String getComponentName() {
        return componentName;
    }

    public void setComponentName(String componentName) {
        this.componentName = componentName;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProductComposition)) return false;
        ProductComposition that = (ProductComposition) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
