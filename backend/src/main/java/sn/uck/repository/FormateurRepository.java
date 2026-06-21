package sn.uck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uck.entity.Formateur;
import java.util.List;
import java.util.Optional;

public interface FormateurRepository extends JpaRepository<Formateur, Long> {
    Optional<Formateur> findByMatricule(String matricule);
    Optional<Formateur> findByEmail(String email);
    List<Formateur> findByType(Formateur.TypeFormateur type);
    List<Formateur> findByStatut(Formateur.StatutFormateur statut);
    boolean existsByMatricule(String matricule);
    boolean existsByEmail(String email);
}
