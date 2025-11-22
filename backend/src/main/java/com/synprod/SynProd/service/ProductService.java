package com.synprod.SynProd.service;

import com.synprod.SynProd.dto.CreateProductRequest;
import com.synprod.SynProd.dto.ProductDto;
import com.synprod.SynProd.dto.ProductCompositionDto;
import com.synprod.SynProd.dto.ProductIngredientDto;
import com.synprod.SynProd.entity.Product;
import com.synprod.SynProd.entity.ProductComposition;
import com.synprod.SynProd.entity.ProductIngredient;
import com.synprod.SynProd.entity.ProductType;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.repository.ProductRepository;
import com.synprod.SynProd.repository.UserRepository;
import com.synprod.SynProd.util.InputSanitizer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InputSanitizer inputSanitizer;

    public ProductService(ProductRepository productRepository, UserRepository userRepository, InputSanitizer inputSanitizer) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.inputSanitizer = inputSanitizer;
    }

    // Helper method to round percentage to 2 decimal places
    private Double roundPercentage(Double percentage) {
        if (percentage == null) {
            return null;
        }
        return BigDecimal.valueOf(percentage)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    // Get all products with basic info (for product list)
    public List<ProductDto> getAllProducts() {
        // Use query that fetches user to prevent N+1 queries
        List<Product> products = productRepository.findAllOrderByNameWithUser();
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Get product by ID with full recipe data
    public ProductDto getProductById(Long id) {
        // First, get the product with basic info and user
        Product product = productRepository.findByIdWithRecipeData(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Then fetch compositions and ingredients separately to avoid Cartesian product
        // issues
        productRepository.findByIdWithCompositions(id).ifPresent(p -> product.setCompositions(p.getCompositions()));

        productRepository.findByIdWithIngredients(id)
                .ifPresent(p -> product.setAdditionalIngredients(p.getAdditionalIngredients()));

        return ProductDto.fromEntity(product);
    }

    // Search products by name
    public List<ProductDto> searchProductsByName(String name) {
        if (name == null || name.isBlank()) {
            return getAllProducts();
        }
        
        // Sanitize input: remove wildcards, limit length to prevent DoS
        String sanitized = sanitizeSearchInput(name);
        String pattern = "%" + sanitized + "%";
        
        List<Product> products = productRepository.findByNameContainingIgnoreCase(pattern);
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    // Helper method to sanitize search input
    private String sanitizeSearchInput(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        
        // Remove existing wildcards to prevent pattern injection
        String sanitized = input.replaceAll("[%_]", "");
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        // Limit length to prevent DoS via complex patterns
        if (sanitized.length() > 100) {
            sanitized = sanitized.substring(0, 100);
        }
        
        return sanitized;
    }

    // Advanced search with multiple filters
    public List<ProductDto> searchProductsWithFilters(
            String name,
            String description,
            String componentName,
            String ingredientName,
            ProductType productType) {
        // Sanitize all search inputs
        String namePattern = name == null || name.isBlank() ? null : "%" + sanitizeSearchInput(name) + "%";
        String descriptionPattern = description == null || description.isBlank() ? null : "%" + sanitizeSearchInput(description) + "%";
        String componentPattern = componentName == null || componentName.isBlank() ? null : "%" + sanitizeSearchInput(componentName) + "%";
        String ingredientPattern = ingredientName == null || ingredientName.isBlank() ? null
                : "%" + sanitizeSearchInput(ingredientName) + "%";

        List<Product> products = productRepository.findWithFilters(
                namePattern, descriptionPattern, componentPattern, ingredientPattern, productType);
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Search by component name
    public List<ProductDto> searchProductsByComponent(String componentName) {
        if (componentName == null || componentName.isBlank()) {
            return getAllProducts();
        }
        
        String pattern = "%" + sanitizeSearchInput(componentName) + "%";
        List<Product> products = productRepository.findByComponentName(pattern);
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Search by ingredient name
    public List<ProductDto> searchProductsByIngredient(String ingredientName) {
        if (ingredientName == null || ingredientName.isBlank()) {
            return getAllProducts();
        }
        
        String pattern = "%" + sanitizeSearchInput(ingredientName) + "%";
        List<Product> products = productRepository.findByIngredientName(pattern);
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Search by product type
    public List<ProductDto> searchProductsByType(ProductType productType) {
        List<Product> products = productRepository.findByProductType(productType);
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Get filter options
    public List<ProductType> getAvailableProductTypes() {
        return productRepository.findDistinctProductTypes();
    }

    public List<String> getAvailableComponents() {
        return productRepository.findDistinctComponentNames();
    }

    public List<String> getAvailableIngredients() {
        return productRepository.findDistinctIngredientNames();
    }

    // Create new product
    public ProductDto createProduct(CreateProductRequest request) {
        // Validate that composition percentages add up to 100% (if any compositions are
        // provided)
        if (request.getCompositions() != null && !request.getCompositions().isEmpty()) {
            double totalPercentage = request.getCompositions().stream()
                    .mapToDouble(ProductCompositionDto::getPercentage)
                    .sum();

            if (Math.abs(totalPercentage - 100.0) > 0.01) { // Allow small floating point differences
                throw new RuntimeException(
                        "Total composition percentage must equal 100%. Current total: " + totalPercentage + "%");
            }
        }

        // Check if product name already exists
        if (productRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), null)) {
            throw new RuntimeException("Product with name '" + request.getName() + "' already exists");
        }

        // Get current user
        User currentUser = getCurrentUser();

        // Create product entity with sanitized inputs
        Product product = new Product();
        product.setName(inputSanitizer.sanitize(request.getName()));
        product.setDescription(inputSanitizer.sanitizeDescription(request.getDescription()));
        product.setProductType(request.getProductType());
        product.setCreatedBy(currentUser);

        // Add compositions
        if (request.getCompositions() != null) {
            for (int i = 0; i < request.getCompositions().size(); i++) {
                ProductCompositionDto compDto = request.getCompositions().get(i);
                ProductComposition composition = new ProductComposition();
                composition.setComponentName(compDto.getComponentName());
                composition.setPercentage(roundPercentage(compDto.getPercentage()));
                composition.setNotes(compDto.getNotes());
                composition.setSortOrder(i);
                product.addComposition(composition);
            }
        }

        // Add additional ingredients
        if (request.getAdditionalIngredients() != null) {
            for (int i = 0; i < request.getAdditionalIngredients().size(); i++) {
                ProductIngredientDto ingDto = request.getAdditionalIngredients().get(i);
                ProductIngredient ingredient = new ProductIngredient();
                ingredient.setIngredientName(ingDto.getIngredientName());
                ingredient.setQuantity(ingDto.getQuantity());
                ingredient.setUnit(ingDto.getUnit());
                ingredient.setNotes(ingDto.getNotes());
                ingredient.setSortOrder(i);
                product.addIngredient(ingredient);
            }
        }

        // Save product
        Product savedProduct = productRepository.save(product);

        // Return full product data
        return ProductDto.fromEntity(savedProduct);
    }

    // Update existing product
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public ProductDto updateProduct(Long id, CreateProductRequest request) {
        // Validate that composition percentages add up to 100% (if any compositions are
        // provided)
        if (request.getCompositions() != null && !request.getCompositions().isEmpty()) {
            double totalPercentage = request.getCompositions().stream()
                    .mapToDouble(ProductCompositionDto::getPercentage)
                    .sum();

            if (Math.abs(totalPercentage - 100.0) > 0.01) { // Allow small floating point differences
                throw new RuntimeException(
                        "Total composition percentage must equal 100%. Current total: " + totalPercentage + "%");
            }
        }

        // Check if product exists and load with full recipe data
        Product product = productRepository.findByIdWithRecipeData(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Load compositions and ingredients separately to avoid Cartesian product
        // issues
        productRepository.findByIdWithCompositions(id).ifPresent(p -> product.setCompositions(p.getCompositions()));

        productRepository.findByIdWithIngredients(id)
                .ifPresent(p -> product.setAdditionalIngredients(p.getAdditionalIngredients()));

        // Check if new name conflicts with existing products (excluding current
        // product)
        if (productRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Product with name '" + request.getName() + "' already exists");
        }

        // Update product fields with sanitized inputs
        product.setName(inputSanitizer.sanitize(request.getName()));
        product.setDescription(inputSanitizer.sanitizeDescription(request.getDescription()));
        product.setProductType(request.getProductType());

        // Clear existing compositions and ingredients
        product.getCompositions().clear();
        product.getAdditionalIngredients().clear();

        // Add new compositions
        if (request.getCompositions() != null) {
            for (int i = 0; i < request.getCompositions().size(); i++) {
                ProductCompositionDto compDto = request.getCompositions().get(i);
                ProductComposition composition = new ProductComposition();
                composition.setComponentName(inputSanitizer.sanitize(compDto.getComponentName()));
                composition.setPercentage(roundPercentage(compDto.getPercentage()));
                composition.setNotes(inputSanitizer.sanitizeDescription(compDto.getNotes()));
                composition.setSortOrder(i);
                product.addComposition(composition);
            }
        }

        // Add new additional ingredients
        if (request.getAdditionalIngredients() != null) {
            for (int i = 0; i < request.getAdditionalIngredients().size(); i++) {
                ProductIngredientDto ingDto = request.getAdditionalIngredients().get(i);
                ProductIngredient ingredient = new ProductIngredient();
                ingredient.setIngredientName(inputSanitizer.sanitize(ingDto.getIngredientName()));
                ingredient.setQuantity(ingDto.getQuantity());
                ingredient.setUnit(inputSanitizer.sanitize(ingDto.getUnit()));
                ingredient.setNotes(inputSanitizer.sanitizeDescription(ingDto.getNotes()));
                ingredient.setSortOrder(i);
                product.addIngredient(ingredient);
            }
        }

        // Save updated product
        Product savedProduct = productRepository.save(product);

        // Return updated product data
        return ProductDto.fromEntity(savedProduct);
    }

    // Delete product
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        productRepository.delete(product);
    }

    // Get products created by current user
    public List<ProductDto> getProductsByCurrentUser() {
        User currentUser = getCurrentUser();
        List<Product> products = productRepository.findByCreatedByIdOrderByCreatedAtDesc(currentUser.getId());
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Helper method to get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }
}
