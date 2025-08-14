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
       @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
       List<Product> findByNameContainingIgnoreCase(@Param("name") String name);

       // Find all products ordered by name
       @Query("SELECT p FROM Product p ORDER BY p.name ASC")
       List<Product> findAllOrderByName();

       // Find products with full composition data
       @Query("SELECT DISTINCT p FROM Product p " +
                     "LEFT JOIN FETCH p.compositions " +
                     "LEFT JOIN FETCH p.additionalIngredients " +
                     "LEFT JOIN FETCH p.createdBy " +
                     "ORDER BY p.name ASC")
       List<Product> findAllWithRecipeData();

       // Find single product with full recipe data
       @Query("SELECT p FROM Product p " +
                     "LEFT JOIN FETCH p.compositions " +
                     "LEFT JOIN FETCH p.additionalIngredients " +
                     "LEFT JOIN FETCH p.createdBy " +
                     "WHERE p.id = :id")
       Optional<Product> findByIdWithRecipeData(@Param("id") Long id);

       // Check if product name exists (excluding specific ID for updates)
       @Query("SELECT COUNT(p) > 0 FROM Product p WHERE LOWER(p.name) = LOWER(:name) AND (:id IS NULL OR p.id != :id)")
       boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Long id);

       // Find products created by specific user
       @Query("SELECT p FROM Product p WHERE p.createdBy.id = :userId ORDER BY p.createdAt DESC")
       List<Product> findByCreatedByIdOrderByCreatedAtDesc(@Param("userId") Long userId);

       // Advanced search with multiple criteria
       @Query("SELECT DISTINCT p FROM Product p " +
                     "LEFT JOIN p.compositions c " +
                     "LEFT JOIN p.additionalIngredients i " +
                     "WHERE (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
                     "AND (:description IS NULL OR LOWER(p.description) LIKE LOWER(CONCAT('%', :description, '%'))) " +
                     "AND (:componentName IS NULL OR LOWER(c.componentName) LIKE LOWER(CONCAT('%', :componentName, '%'))) " +
                     "AND (:ingredientName IS NULL OR LOWER(i.ingredientName) LIKE LOWER(CONCAT('%', :ingredientName, '%'))) " +
                     "AND (:productType IS NULL OR p.productType = :productType) " +
                     "ORDER BY p.name ASC")
       List<Product> findWithFilters(
                     @Param("name") String name,
                     @Param("description") String description,
                     @Param("componentName") String componentName,
                     @Param("ingredientName") String ingredientName,
                     @Param("productType") ProductType productType);

       // Find products with specific component
       @Query("SELECT DISTINCT p FROM Product p " +
                     "JOIN p.compositions c " +
                     "WHERE LOWER(c.componentName) LIKE LOWER(CONCAT('%', :componentName, '%'))")
       List<Product> findByComponentName(@Param("componentName") String componentName);

       // Find products with specific ingredient
       @Query("SELECT DISTINCT p FROM Product p " +
                     "JOIN p.additionalIngredients i " +
                     "WHERE LOWER(i.ingredientName) LIKE LOWER(CONCAT('%', :ingredientName, '%'))")
       List<Product> findByIngredientName(@Param("ingredientName") String ingredientName);

       // Find products by product type
       @Query("SELECT p FROM Product p WHERE p.productType = :productType ORDER BY p.name ASC")
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
