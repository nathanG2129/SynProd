package com.synprod.SynProd.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> getAuthInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        Map<String, Object> info = new HashMap<>();
        
        if (auth == null || !auth.isAuthenticated()) {
            info.put("authenticated", false);
            info.put("message", "Not authenticated");
        } else {
            info.put("authenticated", true);
            info.put("name", auth.getName());
            info.put("principal", auth.getPrincipal().getClass().getSimpleName());
            
            // Get authorities
            info.put("authorities", auth.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .collect(Collectors.toList()));
            
            // Check if admin
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            info.put("isAdmin", isAdmin);
            info.put("canInvite", isAdmin);
            
            // Get user details if available
            if (auth.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) auth.getPrincipal();
                info.put("email", userDetails.getUsername());
                info.put("userAuthorities", userDetails.getAuthorities().stream()
                        .map(a -> a.getAuthority())
                        .collect(Collectors.toList()));
            }
            
            // If principal is our User entity
            if (auth.getPrincipal() instanceof com.synprod.SynProd.entity.User) {
                com.synprod.SynProd.entity.User user = (com.synprod.SynProd.entity.User) auth.getPrincipal();
                info.put("userId", user.getId());
                info.put("userEmail", user.getEmail());
                info.put("userRole", user.getRole() != null ? user.getRole().name() : "null");
                info.put("userStatus", user.getStatus() != null ? user.getStatus().name() : "null");
            }
        }
        
        return ResponseEntity.ok(info);
    }
}

