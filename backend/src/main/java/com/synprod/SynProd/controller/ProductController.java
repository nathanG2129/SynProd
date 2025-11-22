package com.synprod.SynProd.controller;

import com.synprod.SynProd.dto.CreateProductRequest;
import com.synprod.SynProd.dto.ProductDto;
import com.synprod.SynProd.entity.ProductType;
import com.synprod.SynProd.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Get all products (accessible by all authenticated users)
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        try {
            List<ProductDto> products = productService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get product by ID with full recipe data (accessible by all authenticated users)
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        try {
            ProductDto product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search products by name (accessible by all authenticated users)
    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchProducts(@RequestParam String name) {
        try {
            List<ProductDto> products = productService.searchProductsByName(name);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Advanced search with multiple filters (accessible by all authenticated users)
    @GetMapping("/search/advanced")
    public ResponseEntity<List<ProductDto>> searchProductsAdvanced(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String componentName,
            @RequestParam(required = false) String ingredientName,
            @RequestParam(required = false) ProductType productType) {
        try {
            List<ProductDto> products = productService.searchProductsWithFilters(
                    name, description, componentName, ingredientName, productType
            );
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search by component (accessible by all authenticated users)
    @GetMapping("/search/component")
    public ResponseEntity<List<ProductDto>> searchByComponent(@RequestParam String componentName) {
        try {
            List<ProductDto> products = productService.searchProductsByComponent(componentName);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search by ingredient (accessible by all authenticated users)
    @GetMapping("/search/ingredient")
    public ResponseEntity<List<ProductDto>> searchByIngredient(@RequestParam String ingredientName) {
        try {
            List<ProductDto> products = productService.searchProductsByIngredient(ingredientName);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search by product type (accessible by all authenticated users)
    @GetMapping("/search/type")
    public ResponseEntity<List<ProductDto>> searchByProductType(@RequestParam ProductType productType) {
        try {
            List<ProductDto> products = productService.searchProductsByType(productType);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get filter options (accessible by all authenticated users)
    @GetMapping("/filter-options")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("productTypes", productService.getAvailableProductTypes());
            options.put("components", productService.getAvailableComponents());
            options.put("ingredients", productService.getAvailableIngredients());
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new product (MANAGER and ADMIN only)
    @PostMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody CreateProductRequest request) {
        try {
            ProductDto product = productService.createProduct(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(product);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update existing product (MANAGER and ADMIN only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @Valid @RequestBody CreateProductRequest request) {
        try {
            ProductDto product = productService.updateProduct(id, request);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete product (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get products by current user (for managers/admins to see their created products)
    @GetMapping("/my-products")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProductDto>> getMyProducts() {
        try {
            List<ProductDto> products = productService.getProductsByCurrentUser();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
