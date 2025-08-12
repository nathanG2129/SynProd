package com.synprod.SynProd.repository;

import com.synprod.SynProd.entity.Product;
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
           "ORDER BY p.name ASC")
    List<Product> findAllWithRecipeData();

    // Find single product with full recipe data
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.compositions " +
           "LEFT JOIN FETCH p.additionalIngredients " +
           "WHERE p.id = :id")
    Optional<Product> findByIdWithRecipeData(@Param("id") Long id);

    // Check if product name exists (excluding specific ID for updates)
    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE LOWER(p.name) = LOWER(:name) AND (:id IS NULL OR p.id != :id)")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Long id);

    // Find products created by specific user
    @Query("SELECT p FROM Product p WHERE p.createdBy.id = :userId ORDER BY p.createdAt DESC")
    List<Product> findByCreatedByIdOrderByCreatedAtDesc(@Param("userId") Long userId);
}
