package com.synprod.SynProd.service;

import com.synprod.SynProd.entity.Role;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
    public void run(String... args) throws Exception {
        initializeDefaultUsers();
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
}
