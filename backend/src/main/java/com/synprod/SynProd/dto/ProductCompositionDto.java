package com.synprod.SynProd.dto;

import com.synprod.SynProd.entity.ProductComposition;

public class ProductCompositionDto {

    private Long id;
    private String componentName;
    private Double percentage;
    private String notes;
    private Integer sortOrder;

    // Constructors
    public ProductCompositionDto() {
    }

    public ProductCompositionDto(String componentName, Double percentage) {
        this.componentName = componentName;
        this.percentage = percentage;
    }

    public ProductCompositionDto(String componentName, Double percentage, String notes) {
        this.componentName = componentName;
        this.percentage = percentage;
        this.notes = notes;
    }

    // Static factory method
    public static ProductCompositionDto fromEntity(ProductComposition composition) {
        ProductCompositionDto dto = new ProductCompositionDto();
        dto.setId(composition.getId());
        dto.setComponentName(composition.getComponentName());
        dto.setPercentage(composition.getPercentage());
        dto.setNotes(composition.getNotes());
        dto.setSortOrder(composition.getSortOrder());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
