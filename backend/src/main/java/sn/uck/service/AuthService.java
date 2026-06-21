package sn.uck.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import sn.uck.dto.AuthRequest;
import sn.uck.dto.AuthResponse;
import sn.uck.entity.Utilisateur;
import sn.uck.exception.ResourceNotFoundException;
import sn.uck.repository.UtilisateurRepository;
import sn.uck.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
            .token(token)
            .expiresIn(86400L)
            .user(AuthResponse.UserDto.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole().name())
                .photoUrl(user.getPhotoUrl())
                .build())
            .message("Bienvenue " + user.getPrenom() + " !")
            .build();
    }
}
