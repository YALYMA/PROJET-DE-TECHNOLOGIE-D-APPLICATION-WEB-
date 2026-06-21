package sn.uck.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sn.uck.entity.Etudiant;
import java.util.List;
import java.util.Optional;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {

    Optional<Etudiant> findByIne(String ine);
    Optional<Etudiant> findByEmail(String email);
    boolean existsByIne(String ine);
    boolean existsByEmail(String email);

    List<Etudiant> findByFormation(String formation);
    List<Etudiant> findByStatut(Etudiant.StatutEtudiant statut);
    List<Etudiant> findByGenre(Etudiant.Genre genre);

    @Query("SELECT e FROM Etudiant e WHERE " +
           "LOWER(e.nom) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.ine) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Etudiant> searchEtudiants(@Param("q") String query, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Etudiant e WHERE e.statut = :statut")
    Long countByStatut(@Param("statut") Etudiant.StatutEtudiant statut);

    @Query("SELECT e.formation, COUNT(e) FROM Etudiant e GROUP BY e.formation")
    List<Object[]> countByFormation();

    @Query("SELECT e.genre, COUNT(e) FROM Etudiant e GROUP BY e.genre")
    List<Object[]> countByGenre();
}
