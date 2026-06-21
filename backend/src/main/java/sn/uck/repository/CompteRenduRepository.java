package sn.uck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uck.entity.CompteRendu;
import java.util.List;

public interface CompteRenduRepository extends JpaRepository<CompteRendu, Long> {
    List<CompteRendu> findByTypeOrderByDateDesc(CompteRendu.TypeDocument type);
    List<CompteRendu> findByPublieOrderByDateDesc(Boolean publie);
}
