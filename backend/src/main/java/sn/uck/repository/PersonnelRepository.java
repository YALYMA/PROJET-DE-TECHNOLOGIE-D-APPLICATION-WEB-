package sn.uck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uck.entity.Personnel;
import java.util.List;

public interface PersonnelRepository extends JpaRepository<Personnel, Long> {
    List<Personnel> findByActif(Boolean actif);
    boolean existsByMatricule(String matricule);
}
