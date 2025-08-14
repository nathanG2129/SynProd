package com.synprod.SynProd.dto;

import com.synprod.SynProd.entity.ProductType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name must be less than 100 characters")
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Product type is required")
    private ProductType productType;

    @Valid
    private List<ProductCompositionDto> compositions;

    @Valid
    private List<ProductIngredientDto> additionalIngredients;

    // Constructors
    public CreateProductRequest() {
    }

    public CreateProductRequest(String name, String description, ProductType productType) {
        this.name = name;
        this.description = description;
        this.productType = productType;
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

    public ProductType getProductType() {
        return productType;
    }

    public void setProductType(ProductType productType) {
        this.productType = productType;
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
