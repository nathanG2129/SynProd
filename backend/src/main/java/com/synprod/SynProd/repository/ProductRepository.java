package com.synprod.SynProd.repository;

import com.synprod.SynProd.entity.Product;
import com.synprod.SynProd.entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

       // Find products by name (case insensitive search)
       // Expect the caller to provide wildcarded pattern (e.g., %term%) to avoid
       // DB-side CONCAT
       @Query("SELECT p FROM Product p WHERE p.name ILIKE :name AND p.deletedAt IS NULL")
       List<Product> findByNameContainingIgnoreCase(@Param("name") String name);

       // Find all products ordered by name (exclude soft deleted)
       @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL ORDER BY p.name ASC")
       List<Product> findAllOrderByName();

       // Find all products with user (prevents N+1 queries, exclude soft deleted)
       @Query("SELECT p FROM Product p LEFT JOIN FETCH p.createdBy WHERE p.deletedAt IS NULL ORDER BY p.name ASC")
       List<Product> findAllOrderByNameWithUser();

       // Find products with full composition data (exclude soft deleted)
       @Query("SELECT DISTINCT p FROM Product p " +
                     "LEFT JOIN FETCH p.compositions " +
                     "LEFT JOIN FETCH p.additionalIngredients " +
                     "LEFT JOIN FETCH p.createdBy " +
                     "WHERE p.deletedAt IS NULL " +
                     "ORDER BY p.name ASC")
       List<Product> findAllWithRecipeData();

       // Find single product with full recipe data (fetch user first, then collections
       // separately) - Note: soft delete check done in service layer for this method
       @Query("SELECT p FROM Product p " +
                     "LEFT JOIN FETCH p.createdBy " +
                     "WHERE p.id = :id")
       Optional<Product> findByIdWithRecipeData(@Param("id") Long id);

       // Find product compositions for a specific product
       // Note: soft delete check done in service layer before calling this
       @Query("SELECT p FROM Product p " +
                     "LEFT JOIN FETCH p.compositions " +
                     "WHERE p.id = :id")
       Optional<Product> findByIdWithCompositions(@Param("id") Long id);

       // Find product ingredients for a specific product
       // Note: soft delete check done in service layer before calling this
       @Query("SELECT p FROM Product p " +
                     "LEFT JOIN FETCH p.additionalIngredients " +
                     "WHERE p.id = :id")
       Optional<Product> findByIdWithIngredients(@Param("id") Long id);

       // Check if product name exists (excluding specific ID for updates, exclude soft deleted)
       @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.deletedAt IS NULL AND LOWER(p.name) = LOWER(:name) AND (:id IS NULL OR p.id != :id)")
       boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Long id);

       // Find products created by specific user (exclude soft deleted)
       @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL AND p.createdBy.id = :userId ORDER BY p.createdAt DESC")
       List<Product> findByCreatedByIdOrderByCreatedAtDesc(@Param("userId") Long userId);

       // Advanced search with multiple criteria (PostgreSQL-specific ILIKE for
       // case-insensitive matching)
       // Caller must pass pre-wildcarded parameters (e.g., %term%)
       @Query("SELECT DISTINCT p FROM Product p " +
                     "LEFT JOIN p.compositions c " +
                     "LEFT JOIN p.additionalIngredients i " +
                     "WHERE p.deletedAt IS NULL " +
                     "AND (:name IS NULL OR p.name ILIKE :name) " +
                     "AND (:description IS NULL OR p.description ILIKE :description) " +
                     "AND (:componentName IS NULL OR c.componentName ILIKE :componentName) " +
                     "AND (:ingredientName IS NULL OR i.ingredientName ILIKE :ingredientName) " +
                     "AND (:productType IS NULL OR p.productType = :productType) " +
                     "ORDER BY p.name ASC")
       List<Product> findWithFilters(
                     @Param("name") String name,
                     @Param("description") String description,
                     @Param("componentName") String componentName,
                     @Param("ingredientName") String ingredientName,
                     @Param("productType") ProductType productType);

       // Find products with specific component (use ILIKE with pre-wildcarded param, exclude soft deleted)
       @Query("SELECT DISTINCT p FROM Product p " +
                     "JOIN p.compositions c " +
                     "WHERE p.deletedAt IS NULL AND c.componentName ILIKE :componentName")
       List<Product> findByComponentName(@Param("componentName") String componentName);

       // Find products with specific ingredient (use ILIKE with pre-wildcarded param, exclude soft deleted)
       @Query("SELECT DISTINCT p FROM Product p " +
                     "JOIN p.additionalIngredients i " +
                     "WHERE p.deletedAt IS NULL AND i.ingredientName ILIKE :ingredientName")
       List<Product> findByIngredientName(@Param("ingredientName") String ingredientName);

       // Find products by product type (exclude soft deleted)
       @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL AND p.productType = :productType ORDER BY p.name ASC")
       List<Product> findByProductType(@Param("productType") ProductType productType);

       // Get all product types used in products
       @Query("SELECT DISTINCT p.productType FROM Product p ORDER BY p.productType")
       List<ProductType> findDistinctProductTypes();

       // Get all unique component names
       @Query("SELECT DISTINCT c.componentName FROM ProductComposition c ORDER BY c.componentName")
       List<String> findDistinctComponentNames();

       // Get all unique ingredient names
       @Query("SELECT DISTINCT i.ingredientName FROM ProductIngredient i ORDER BY i.ingredientName")
       List<String> findDistinctIngredientNames();
}
