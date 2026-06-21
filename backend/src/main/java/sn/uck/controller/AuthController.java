package sn.uck.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import sn.uck.dto.AuthRequest;
import sn.uck.dto.AuthResponse;
import sn.uck.entity.Utilisateur;
import sn.uck.exception.ResourceNotFoundException;
import sn.uck.repository.UtilisateurRepository;
import sn.uck.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UtilisateurRepository utilisateurRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh() {
        // Stateless JWT : le client doit se reconnecter
        return ResponseEntity.ok(Map.of("message", "Veuillez vous reconnecter"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // Stateless : invalidation côté client uniquement
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> me(@AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur user = utilisateurRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        return ResponseEntity.ok(AuthResponse.UserDto.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole().name())
                .photoUrl(user.getPhotoUrl())
                .build());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(utilisateurRepository.findAll().stream()
                .map(u -> AuthResponse.UserDto.builder()
                        .id(u.getId())
                        .nom(u.getNom())
                        .prenom(u.getPrenom())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .build())
                .toList());
    }
}
