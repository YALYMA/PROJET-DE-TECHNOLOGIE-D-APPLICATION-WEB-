package sn.uck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uck.entity.Stage;
import java.util.List;

public interface StageRepository extends JpaRepository<Stage, Long> {
    List<Stage> findByEtudiantContainingIgnoreCase(String etudiant);
    List<Stage> findByBilan(Stage.BilanStage bilan);
}
