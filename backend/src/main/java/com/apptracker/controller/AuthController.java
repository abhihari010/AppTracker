package com.apptracker.controller;

import com.apptracker.dto.*;
import com.apptracker.model.User;
import com.apptracker.repository.UserRepository;
import com.apptracker.security.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder pwEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepo, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody RegisterRequest req) {
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already taken"));
        }
        User u = new User();
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setPasswordHash(pwEncoder.encode(req.getPassword()));
        User saved = userRepo.save(u);

        String token = jwtUtil.generateToken(saved.getId());
        UserDTO userDTO = new UserDTO(saved.getId(), saved.getName(), saved.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, userDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Validated @RequestBody LoginRequest req) {
        var opt = userRepo.findByEmail(req.getEmail());
        if (opt.isEmpty())
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));

        User u = opt.get();
        if (!pwEncoder.matches(req.getPassword(), u.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(u.getId());
        UserDTO userDTO = new UserDTO(u.getId(), u.getName(), u.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, userDTO));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDTO = new UserDTO(user.getId(), user.getName(), user.getEmail());
        return ResponseEntity.ok(userDTO);
    }
}
