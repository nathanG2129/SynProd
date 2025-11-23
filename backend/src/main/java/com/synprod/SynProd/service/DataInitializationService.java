package com.synprod.SynProd.service;

import com.synprod.SynProd.entity.*;
import com.synprod.SynProd.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DataInitializationService implements CommandLineRunner {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Value("${app.admin.password}")
        private String adminPassword;

        @Value("${app.manager.password}")
        private String managerPassword;

        @Override
        @Transactional
        public void run(String... args) throws Exception {
                initializeDefaultUsers();
                updateExistingUsersWithMissingFields();
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
                        admin.setStatus(UserStatus.ACTIVE);
                        // Ensure createdAt is set (handled by @PrePersist, but explicit for clarity)
                        admin.setCreatedAt(LocalDateTime.now());
                        userRepository.save(admin);
                        System.out.println("✅ Admin user created successfully");
                        System.out.println("   Email: admin@synprod.com");
                        System.out.println("   Role: ADMIN");
                        System.out.println("   Status: ACTIVE");
                } else {
                        // Update existing admin user to ensure all fields are set
                        userRepository.findByEmail("admin@synprod.com").ifPresent(admin -> {
                                boolean updated = false;
                                if (admin.getFirstName() == null) {
                                        admin.setFirstName("System");
                                        updated = true;
                                }
                                if (admin.getLastName() == null) {
                                        admin.setLastName("Administrator");
                                        updated = true;
                                }
                                if (admin.getRole() == null) {
                                        admin.setRole(Role.ADMIN);
                                        updated = true;
                                }
                                if (admin.getStatus() == null) {
                                        admin.setStatus(UserStatus.ACTIVE);
                                        updated = true;
                                }
                                if (admin.getCreatedAt() == null) {
                                        admin.setCreatedAt(LocalDateTime.now());
                                        updated = true;
                                }
                                // Reset password if it's BCrypt (starts with $2a$ or $2b$) or null
                                if (admin.getPassword() == null || admin.getPassword().startsWith("$2a$")
                                                || admin.getPassword().startsWith("$2b$")) {
                                        admin.setPassword(passwordEncoder.encode(adminPassword));
                                        updated = true;
                                        System.out.println("✅ Admin password reset to Argon2");
                                }
                                if (updated) {
                                        userRepository.save(admin);
                                        System.out.println("✅ Admin user updated with missing fields");
                                }
                                System.out.println("ℹ️  Admin user already exists");
                        });
                }

                // Create Manager user if not exists
                if (!userRepository.existsByEmail("manager@synprod.com")) {
                        User manager = new User();
                        manager.setFirstName("Production");
                        manager.setLastName("Manager");
                        manager.setEmail("manager@synprod.com");
                        manager.setPassword(passwordEncoder.encode(managerPassword));
                        manager.setRole(Role.MANAGER);
                        manager.setStatus(UserStatus.ACTIVE);
                        // Ensure createdAt is set
                        manager.setCreatedAt(LocalDateTime.now());
                        userRepository.save(manager);
                        System.out.println("✅ Manager user created successfully");
                        System.out.println("   Email: manager@synprod.com");
                        System.out.println("   Role: MANAGER");
                        System.out.println("   Status: ACTIVE");
                } else {
                        // Update existing manager user to ensure all fields are set
                        userRepository.findByEmail("manager@synprod.com").ifPresent(manager -> {
                                boolean updated = false;
                                if (manager.getFirstName() == null) {
                                        manager.setFirstName("Production");
                                        updated = true;
                                }
                                if (manager.getLastName() == null) {
                                        manager.setLastName("Manager");
                                        updated = true;
                                }
                                if (manager.getRole() == null) {
                                        manager.setRole(Role.MANAGER);
                                        updated = true;
                                }
                                if (manager.getStatus() == null) {
                                        manager.setStatus(UserStatus.ACTIVE);
                                        updated = true;
                                }
                                if (manager.getCreatedAt() == null) {
                                        manager.setCreatedAt(LocalDateTime.now());
                                        updated = true;
                                }
                                // Reset password if it's BCrypt (starts with $2a$ or $2b$) or null
                                if (manager.getPassword() == null || manager.getPassword().startsWith("$2a$")
                                                || manager.getPassword().startsWith("$2b$")) {
                                        manager.setPassword(passwordEncoder.encode(managerPassword));
                                        updated = true;
                                        System.out.println("✅ Manager password reset to Argon2");
                                }
                                if (updated) {
                                        userRepository.save(manager);
                                        System.out.println("✅ Manager user updated with missing fields");
                                }
                                System.out.println("ℹ️  Manager user already exists");
                        });
                }

                System.out.println("🔐 Default user initialization completed");
        }

        /**
         * Update any existing users that have null values for required fields
         * This ensures backwards compatibility with users created before the migration
         */
        private void updateExistingUsersWithMissingFields() {
                List<User> allUsers = userRepository.findAll();
                int updatedCount = 0;

                for (User user : allUsers) {
                        boolean needsUpdate = false;

                        // Set default firstName if null
                        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
                                user.setFirstName("");
                                needsUpdate = true;
                        }

                        // Set default lastName if null
                        if (user.getLastName() == null || user.getLastName().trim().isEmpty()) {
                                user.setLastName("");
                                needsUpdate = true;
                        }

                        // Set default role if null (shouldn't happen, but safety check)
                        if (user.getRole() == null) {
                                user.setRole(Role.PRODUCTION);
                                needsUpdate = true;
                        }

                        // Set default status if null (shouldn't happen, but safety check)
                        if (user.getStatus() == null) {
                                // If user has a password, assume they were active before migration
                                user.setStatus(user.getPassword() != null ? UserStatus.ACTIVE : UserStatus.PENDING);
                                needsUpdate = true;
                        }

                        // Ensure createdAt is set
                        if (user.getCreatedAt() == null) {
                                user.setCreatedAt(LocalDateTime.now());
                                needsUpdate = true;
                        }

                        if (needsUpdate) {
                                userRepository.save(user);
                                updatedCount++;
                        }
                }

                if (updatedCount > 0) {
                        System.out.println("✅ Updated " + updatedCount + " user(s) with missing required fields");
                }
        }
}
