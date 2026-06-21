package sn.uck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uck.entity.Utilisateur;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    boolean existsByEmail(String email);
}
