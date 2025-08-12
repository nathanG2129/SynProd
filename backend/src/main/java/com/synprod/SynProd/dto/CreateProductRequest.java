package com.synprod.SynProd.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name must be less than 100 characters")
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Base weight is required")
    @Positive(message = "Base weight must be positive")
    private Double baseWeight;

    @NotBlank(message = "Base weight unit is required")
    @Size(max = 20, message = "Base weight unit must be less than 20 characters")
    private String baseWeightUnit;

    @Valid
    private List<ProductCompositionDto> compositions;

    @Valid
    private List<ProductIngredientDto> additionalIngredients;

    // Constructors
    public CreateProductRequest() {
    }

    public CreateProductRequest(String name, String description, Double baseWeight, String baseWeightUnit) {
        this.name = name;
        this.description = description;
        this.baseWeight = baseWeight;
        this.baseWeightUnit = baseWeightUnit;
    }

    // Getters and Setters
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
}
