package sn.uck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uck.entity.Courrier;
import java.util.List;

public interface CourrierRepository extends JpaRepository<Courrier, Long> {
    List<Courrier> findByStatutOrderByDateDesc(Courrier.StatutCourrier statut);
    List<Courrier> findByUrgentTrue();
    boolean existsByReference(String reference);
}
