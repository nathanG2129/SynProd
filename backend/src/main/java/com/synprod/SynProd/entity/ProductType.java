package com.synprod.SynProd.entity;

public enum ProductType {
    GREEK_YOGURT("Greek Yogurt", 380.0, "g"),
    CHEESE("Cheese", 400.0, "g"),
    DRINKS("Drinks", 220.0, "g");

    private final String displayName;
    private final Double baseWeight;
    private final String baseWeightUnit;

    ProductType(String displayName, Double baseWeight, String baseWeightUnit) {
        this.displayName = displayName;
        this.baseWeight = baseWeight;
        this.baseWeightUnit = baseWeightUnit;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Double getBaseWeight() {
        return baseWeight;
    }

    public String getBaseWeightUnit() {
        return baseWeightUnit;
    }

    public String getBaseWeightDisplay() {
        return baseWeight + baseWeightUnit;
    }
}
