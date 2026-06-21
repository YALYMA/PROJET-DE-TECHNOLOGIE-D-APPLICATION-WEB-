package sn.uck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.uck.entity.Partenaire;
import java.util.List;

public interface PartenaireRepository extends JpaRepository<Partenaire, Long> {
    List<Partenaire> findByActif(Boolean actif);
}
