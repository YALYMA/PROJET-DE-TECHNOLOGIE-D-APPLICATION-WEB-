package sn.uck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uck.entity.Formation;
import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByStatut(Formation.StatutFormation statut);
    List<Formation> findByType(String type);
}
