package com.synprod.SynProd.service;

import com.synprod.SynProd.entity.*;
import com.synprod.SynProd.repository.ProductRepository;
import com.synprod.SynProd.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.manager.password}")
    private String managerPassword;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultUsers();
        initializeSampleProducts();
    }

    private void initializeDefaultUsers() {
        // Create Admin user if not exists
        if (!userRepository.existsByEmail("admin@synprod.com")) {
            User admin = new User();
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setEmail("admin@synprod.com");
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            admin.setEmailVerified(true);
            userRepository.save(admin);
            System.out.println("✅ Admin user created successfully");
            System.out.println("   Email: admin@synprod.com");
            System.out.println("   Role: ADMIN");
        } else {
            System.out.println("ℹ️  Admin user already exists");
        }

        // Create Manager user if not exists
        if (!userRepository.existsByEmail("manager@synprod.com")) {
            User manager = new User();
            manager.setFirstName("Production");
            manager.setLastName("Manager");
            manager.setEmail("manager@synprod.com");
            manager.setPassword(passwordEncoder.encode(managerPassword));
            manager.setRole(Role.MANAGER);
            manager.setEnabled(true);
            manager.setEmailVerified(true);
            userRepository.save(manager);
            System.out.println("✅ Manager user created successfully");
            System.out.println("   Email: manager@synprod.com");
            System.out.println("   Role: MANAGER");
        } else {
            System.out.println("ℹ️  Manager user already exists");
        }

        System.out.println("🔐 Default user initialization completed");
    }

    private void initializeSampleProducts() {
        // Check if products already exist to avoid duplicates
        if (productRepository.count() > 0) {
            System.out.println("ℹ️  Sample products already exist, skipping initialization");
            return;
        }

        User admin = userRepository.findByEmail("admin@synprod.com").orElse(null);
        User manager = userRepository.findByEmail("manager@synprod.com").orElse(null);

        if (admin == null || manager == null) {
            System.out.println("⚠️  Cannot create sample products - default users not found");
            return;
        }

        System.out.println("🏭 Initializing sample products...");

        // Initialize Greek Yogurt products
        initializeGreekYogurtProducts(admin, manager);

        // Initialize Cheese products
        initializeCheeseProducts(admin, manager);

        // Initialize Drink products
        initializeDrinkProducts(admin, manager);

        System.out.println("✅ Sample product initialization completed");
        System.out.println("   Total products created: " + productRepository.count());
    }

    private void initializeGreekYogurtProducts(User admin, User manager) {
        System.out.println("🥛 Creating Greek Yogurt products...");

        // Traditional Greek Yogurt
        createProduct("Traditional Greek Yogurt",
                "Classic thick and creamy Greek yogurt with authentic taste",
                ProductType.GREEK_YOGURT, admin,
                List.of(
                        new ProductComposition("Milk", 85.0, "Whole milk base"),
                        new ProductComposition("Live Cultures", 12.0,
                                "Lactobacillus bulgaricus, Streptococcus thermophilus"),
                        new ProductComposition("Cream", 3.0, "For extra richness")),
                List.of(
                        new ProductIngredient("Salt", 0.2, "g", "For flavor enhancement")));

        // Honey Greek Yogurt
        createProduct("Honey Greek Yogurt",
                "Sweet and creamy Greek yogurt with natural honey",
                ProductType.GREEK_YOGURT, manager,
                List.of(
                        new ProductComposition("Milk", 80.0, "Whole milk base"),
                        new ProductComposition("Live Cultures", 10.0, "Probiotic cultures"),
                        new ProductComposition("Honey", 8.0, "Natural wildflower honey"),
                        new ProductComposition("Cream", 2.0, "For texture")),
                List.of(
                        new ProductIngredient("Vanilla Extract", 0.5, "ml", "Natural vanilla")));

        // Strawberry Greek Yogurt
        createProduct("Strawberry Greek Yogurt",
                "Fresh strawberry flavored Greek yogurt",
                ProductType.GREEK_YOGURT, admin,
                List.of(
                        new ProductComposition("Milk", 75.0, "Whole milk base"),
                        new ProductComposition("Live Cultures", 10.0, "Active cultures"),
                        new ProductComposition("Strawberry Puree", 12.0, "Fresh strawberry puree"),
                        new ProductComposition("Sugar", 3.0, "Organic cane sugar")),
                List.of(
                        new ProductIngredient("Natural Flavoring", 0.3, "ml", "Strawberry essence"),
                        new ProductIngredient("Citric Acid", 0.1, "g", "For freshness")));

        // Protein Greek Yogurt
        createProduct("High Protein Greek Yogurt",
                "Extra protein Greek yogurt for fitness enthusiasts",
                ProductType.GREEK_YOGURT, manager,
                List.of(
                        new ProductComposition("Milk", 70.0, "Skim milk base"),
                        new ProductComposition("Live Cultures", 8.0, "Probiotic cultures"),
                        new ProductComposition("Whey Protein", 15.0, "Concentrated whey protein"),
                        new ProductComposition("Milk Protein", 7.0, "Casein protein")),
                List.of(
                        new ProductIngredient("Stevia", 0.2, "g", "Natural sweetener"),
                        new ProductIngredient("Vanilla", 0.5, "ml", "Natural vanilla extract")));

        // Blueberry Greek Yogurt
        createProduct("Blueberry Greek Yogurt",
                "Antioxidant-rich blueberry Greek yogurt",
                ProductType.GREEK_YOGURT, admin,
                List.of(
                        new ProductComposition("Milk", 76.0, "Whole milk base"),
                        new ProductComposition("Live Cultures", 9.0, "Active cultures"),
                        new ProductComposition("Blueberry Pieces", 10.0, "Fresh blueberry pieces"),
                        new ProductComposition("Sugar", 5.0, "Organic sugar")),
                List.of(
                        new ProductIngredient("Pectin", 0.2, "g", "Natural thickener"),
                        new ProductIngredient("Lemon Juice", 0.3, "ml", "For natural preservation")));
    }

    private void initializeCheeseProducts(User admin, User manager) {
        System.out.println("🧀 Creating Cheese products...");

        // Feta Cheese
        createProduct("Traditional Feta Cheese",
                "Authentic Greek feta cheese made from sheep and goat milk",
                ProductType.CHEESE, admin,
                List.of(
                        new ProductComposition("Sheep Milk", 60.0, "Fresh sheep milk"),
                        new ProductComposition("Goat Milk", 25.0, "Fresh goat milk"),
                        new ProductComposition("Salt", 12.0, "Sea salt for brining"),
                        new ProductComposition("Rennet", 3.0, "Natural cheese cultures")),
                List.of(
                        new ProductIngredient("Calcium Chloride", 0.1, "g", "For firming"),
                        new ProductIngredient("Lipase", 0.05, "g", "For flavor development")));

        // Mozzarella Cheese
        createProduct("Fresh Mozzarella Cheese",
                "Creamy fresh mozzarella perfect for salads and pizza",
                ProductType.CHEESE, manager,
                List.of(
                        new ProductComposition("Cow Milk", 85.0, "Fresh whole milk"),
                        new ProductComposition("Citric Acid", 5.0, "For acidification"),
                        new ProductComposition("Rennet", 8.0, "Cheese making cultures"),
                        new ProductComposition("Salt", 2.0, "For flavor")),
                List.of(
                        new ProductIngredient("Water", 2.0, "ml", "For texture"),
                        new ProductIngredient("Calcium Chloride", 0.1, "g", "Firming agent")));

        // Cheddar Cheese
        createProduct("Aged Cheddar Cheese",
                "Sharp aged cheddar with complex flavor profile",
                ProductType.CHEESE, admin,
                List.of(
                        new ProductComposition("Cow Milk", 82.0, "High-quality milk"),
                        new ProductComposition("Cheese Cultures", 10.0, "Lactococcus cultures"),
                        new ProductComposition("Salt", 6.0, "For aging process"),
                        new ProductComposition("Rennet", 2.0, "Animal rennet")),
                List.of(
                        new ProductIngredient("Annatto", 0.1, "g", "Natural coloring"),
                        new ProductIngredient("Calcium Chloride", 0.08, "g", "Texture enhancer")));

        // Goat Cheese
        createProduct("Creamy Goat Cheese",
                "Soft and tangy goat cheese with herbs",
                ProductType.CHEESE, manager,
                List.of(
                        new ProductComposition("Goat Milk", 88.0, "Fresh goat milk"),
                        new ProductComposition("Cheese Cultures", 8.0, "Lactic acid cultures"),
                        new ProductComposition("Salt", 3.0, "Sea salt"),
                        new ProductComposition("Herbs", 1.0, "Mixed fresh herbs")),
                List.of(
                        new ProductIngredient("Thyme", 0.2, "g", "Dried thyme"),
                        new ProductIngredient("Rosemary", 0.1, "g", "Fresh rosemary")));

        // Ricotta Cheese
        createProduct("Fresh Ricotta Cheese",
                "Light and fluffy ricotta made from whey",
                ProductType.CHEESE, admin,
                List.of(
                        new ProductComposition("Whey", 75.0, "Fresh whey from cheese making"),
                        new ProductComposition("Milk", 20.0, "Whole milk"),
                        new ProductComposition("Vinegar", 3.0, "White vinegar for coagulation"),
                        new ProductComposition("Salt", 2.0, "Fine sea salt")),
                List.of(
                        new ProductIngredient("Citric Acid", 0.2, "g", "For coagulation"),
                        new ProductIngredient("Calcium Chloride", 0.05, "g", "Texture improver")));
    }

    private void initializeDrinkProducts(User admin, User manager) {
        System.out.println("🥤 Creating Drink products...");

        // Fruit Smoothie
        createProduct("Mixed Berry Smoothie",
                "Refreshing smoothie with mixed berries and yogurt",
                ProductType.DRINKS, admin,
                List.of(
                        new ProductComposition("Water", 45.0, "Purified water base"),
                        new ProductComposition("Mixed Berries", 25.0, "Strawberries, blueberries, raspberries"),
                        new ProductComposition("Yogurt", 20.0, "Greek yogurt"),
                        new ProductComposition("Honey", 10.0, "Natural sweetener")),
                List.of(
                        new ProductIngredient("Vitamin C", 0.1, "g", "Ascorbic acid"),
                        new ProductIngredient("Natural Flavoring", 0.2, "ml", "Berry essence")));

        // Protein Shake
        createProduct("Chocolate Protein Shake",
                "High-protein chocolate shake for post-workout recovery",
                ProductType.DRINKS, manager,
                List.of(
                        new ProductComposition("Water", 50.0, "Purified water"),
                        new ProductComposition("Whey Protein", 30.0, "Chocolate whey protein"),
                        new ProductComposition("Cocoa Powder", 15.0, "Natural cocoa"),
                        new ProductComposition("Stevia", 5.0, "Natural sweetener")),
                List.of(
                        new ProductIngredient("Lecithin", 0.3, "g", "Emulsifier"),
                        new ProductIngredient("Vanilla Extract", 0.2, "ml", "Natural vanilla"),
                        new ProductIngredient("Xanthan Gum", 0.1, "g", "Thickener")));

        // Green Juice
        createProduct("Green Detox Juice",
                "Nutrient-packed green vegetable and fruit juice",
                ProductType.DRINKS, admin,
                List.of(
                        new ProductComposition("Water", 40.0, "Filtered water"),
                        new ProductComposition("Spinach", 20.0, "Fresh baby spinach"),
                        new ProductComposition("Cucumber", 15.0, "Fresh cucumber"),
                        new ProductComposition("Apple", 15.0, "Green apple"),
                        new ProductComposition("Lemon", 10.0, "Fresh lemon juice")),
                List.of(
                        new ProductIngredient("Ginger", 0.5, "g", "Fresh ginger root"),
                        new ProductIngredient("Mint", 0.3, "g", "Fresh mint leaves")));

        // Kombucha
        createProduct("Ginger Lemon Kombucha",
                "Probiotic fermented tea with ginger and lemon",
                ProductType.DRINKS, manager,
                List.of(
                        new ProductComposition("Tea Base", 70.0, "Fermented black tea"),
                        new ProductComposition("Water", 20.0, "Filtered water"),
                        new ProductComposition("Ginger", 5.0, "Fresh ginger juice"),
                        new ProductComposition("Lemon", 5.0, "Fresh lemon juice")),
                List.of(
                        new ProductIngredient("SCOBY Culture", 1.0, "g", "Symbiotic culture"),
                        new ProductIngredient("Organic Sugar", 0.5, "g", "For fermentation"),
                        new ProductIngredient("Carbonation", 0.2, "g", "Natural CO2")));

        // Coconut Water
        createProduct("Tropical Coconut Water",
                "Pure coconut water with natural electrolytes",
                ProductType.DRINKS, admin,
                List.of(
                        new ProductComposition("Coconut Water", 95.0, "Fresh coconut water"),
                        new ProductComposition("Pineapple Juice", 3.0, "Natural pineapple"),
                        new ProductComposition("Mango Puree", 2.0, "Fresh mango puree")),
                List.of(
                        new ProductIngredient("Natural Flavoring", 0.1, "ml", "Tropical essence"),
                        new ProductIngredient("Vitamin C", 0.05, "g", "Ascorbic acid"),
                        new ProductIngredient("Potassium", 0.3, "g", "Natural electrolyte")));

        // Energy Drink
        createProduct("Natural Energy Boost",
                "Natural energy drink with green tea and guarana",
                ProductType.DRINKS, manager,
                List.of(
                        new ProductComposition("Water", 60.0, "Purified water"),
                        new ProductComposition("Green Tea Extract", 20.0, "Concentrated green tea"),
                        new ProductComposition("Guarana Extract", 10.0, "Natural caffeine source"),
                        new ProductComposition("Fruit Juice", 10.0, "Mixed citrus juices")),
                List.of(
                        new ProductIngredient("B-Vitamins", 0.2, "g", "Vitamin complex"),
                        new ProductIngredient("Taurine", 0.5, "g", "Amino acid"),
                        new ProductIngredient("Natural Caffeine", 0.08, "g", "From guarana")));
    }

    private void createProduct(String name, String description, ProductType productType,
            User createdBy, List<ProductComposition> compositions,
            List<ProductIngredient> ingredients) {
        try {
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setProductType(productType);
            product.setCreatedBy(createdBy);

            // Add compositions
            for (int i = 0; i < compositions.size(); i++) {
                ProductComposition comp = compositions.get(i);
                comp.setProduct(product);
                comp.setSortOrder(i);
            }
            product.setCompositions(new ArrayList<>(compositions));

            // Add ingredients
            for (int i = 0; i < ingredients.size(); i++) {
                ProductIngredient ing = ingredients.get(i);
                ing.setProduct(product);
                ing.setSortOrder(i);
            }
            product.setAdditionalIngredients(new ArrayList<>(ingredients));

            productRepository.save(product);
            System.out.println("   ✅ Created: " + name);
        } catch (Exception e) {
            System.err.println("   ❌ Failed to create " + name + ": " + e.getMessage());
        }
    }
}
