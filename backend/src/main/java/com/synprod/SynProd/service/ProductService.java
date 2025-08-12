package com.synprod.SynProd.service;

import com.synprod.SynProd.dto.CreateProductRequest;
import com.synprod.SynProd.dto.ProductDto;
import com.synprod.SynProd.dto.ProductCompositionDto;
import com.synprod.SynProd.dto.ProductIngredientDto;
import com.synprod.SynProd.entity.Product;
import com.synprod.SynProd.entity.ProductComposition;
import com.synprod.SynProd.entity.ProductIngredient;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.repository.ProductRepository;
import com.synprod.SynProd.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // Get all products with basic info (for product list)
    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepository.findAllOrderByName();
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Get product by ID with full recipe data
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findByIdWithRecipeData(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        return ProductDto.fromEntity(product);
    }

    // Search products by name
    public List<ProductDto> searchProductsByName(String name) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Advanced search with multiple filters
    public List<ProductDto> searchProductsWithFilters(
            String name,
            String description,
            String componentName,
            String ingredientName,
            Double minWeight,
            Double maxWeight,
            String unit
    ) {
        List<Product> products = productRepository.findWithFilters(
                name, description, componentName, ingredientName, minWeight, maxWeight, unit
        );
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Search by component name
    public List<ProductDto> searchProductsByComponent(String componentName) {
        List<Product> products = productRepository.findByComponentName(componentName);
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Search by ingredient name
    public List<ProductDto> searchProductsByIngredient(String ingredientName) {
        List<Product> products = productRepository.findByIngredientName(ingredientName);
        return products.stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Get filter options
    public List<String> getAvailableUnits() {
        return productRepository.findDistinctUnits();
    }

    public List<String> getAvailableComponents() {
        return productRepository.findDistinctComponentNames();
    }

    public List<String> getAvailableIngredients() {
        return productRepository.findDistinctIngredientNames();
    }

    // Create new product
    public ProductDto createProduct(CreateProductRequest request) {
        // Validate that composition percentages add up to 100% (if any compositions are provided)
        if (request.getCompositions() != null && !request.getCompositions().isEmpty()) {
            double totalPercentage = request.getCompositions().stream()
                    .mapToDouble(ProductCompositionDto::getPercentage)
                    .sum();
            
            if (Math.abs(totalPercentage - 100.0) > 0.01) { // Allow small floating point differences
                throw new RuntimeException("Total composition percentage must equal 100%. Current total: " + totalPercentage + "%");
            }
        }

        // Check if product name already exists
        if (productRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), null)) {
            throw new RuntimeException("Product with name '" + request.getName() + "' already exists");
        }

        // Get current user
        User currentUser = getCurrentUser();

        // Create product entity
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBaseWeight(request.getBaseWeight());
        product.setBaseWeightUnit(request.getBaseWeightUnit());
        product.setCreatedBy(currentUser);

        // Add compositions
        if (request.getCompositions() != null) {
            for (int i = 0; i < request.getCompositions().size(); i++) {
                ProductCompositionDto compDto = request.getCompositions().get(i);
                ProductComposition composition = new ProductComposition();
                composition.setComponentName(compDto.getComponentName());
                composition.setPercentage(compDto.getPercentage());
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
    public ProductDto updateProduct(Long id, CreateProductRequest request) {
        // Validate that composition percentages add up to 100% (if any compositions are provided)
        if (request.getCompositions() != null && !request.getCompositions().isEmpty()) {
            double totalPercentage = request.getCompositions().stream()
                    .mapToDouble(ProductCompositionDto::getPercentage)
                    .sum();
            
            if (Math.abs(totalPercentage - 100.0) > 0.01) { // Allow small floating point differences
                throw new RuntimeException("Total composition percentage must equal 100%. Current total: " + totalPercentage + "%");
            }
        }

        // Check if product exists
        Product product = productRepository.findByIdWithRecipeData(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Check if new name conflicts with existing products (excluding current product)
        if (productRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Product with name '" + request.getName() + "' already exists");
        }

        // Update product fields
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBaseWeight(request.getBaseWeight());
        product.setBaseWeightUnit(request.getBaseWeightUnit());

        // Clear existing compositions and ingredients
        product.getCompositions().clear();
        product.getAdditionalIngredients().clear();

        // Add new compositions
        if (request.getCompositions() != null) {
            for (int i = 0; i < request.getCompositions().size(); i++) {
                ProductCompositionDto compDto = request.getCompositions().get(i);
                ProductComposition composition = new ProductComposition();
                composition.setComponentName(compDto.getComponentName());
                composition.setPercentage(compDto.getPercentage());
                composition.setNotes(compDto.getNotes());
                composition.setSortOrder(i);
                product.addComposition(composition);
            }
        }

        // Add new additional ingredients
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
