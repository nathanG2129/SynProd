package com.synprod.SynProd.controller;

import com.synprod.SynProd.dto.InviteUserRequest;
import com.synprod.SynProd.dto.UserDto;
import com.synprod.SynProd.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/invite")
    public ResponseEntity<UserDto> inviteUser(@Valid @RequestBody InviteUserRequest request) {
        UserDto userDto = userService.inviteUser(request);
        return ResponseEntity.ok(userDto);
    }
}

