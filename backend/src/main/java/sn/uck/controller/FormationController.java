package sn.uck.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uck.entity.Formation;
import sn.uck.exception.ResourceNotFoundException;
import sn.uck.repository.FormationRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationRepository formationRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String statut) {

        List<Formation> formations = formationRepository.findAll();

        if (type != null && !type.isBlank()) {
            formations = formations.stream()
                    .filter(f -> type.equalsIgnoreCase(f.getType()))
                    .toList();
        }
        if (statut != null && !statut.isBlank()) {
            formations = formations.stream()
                    .filter(f -> f.getStatut() != null && statut.equalsIgnoreCase(f.getStatut().name()))
                    .toList();
        }
        return ResponseEntity.ok(Map.of("data", formations, "total", formations.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formation> getById(@PathVariable Long id) {
        Formation f = formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation", "id", id));
        return ResponseEntity.ok(f);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','RESPONSABLE_FORMATION')")
    public ResponseEntity<Formation> create(@RequestBody Formation formation) {
        return ResponseEntity.status(201).body(formationRepository.save(formation));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','RESPONSABLE_FORMATION')")
    public ResponseEntity<Formation> update(@PathVariable Long id, @RequestBody Formation body) {
        Formation f = formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation", "id", id));
        f.setNom(body.getNom());
        f.setType(body.getType());
        f.setNiveau(body.getNiveau());
        f.setDateDebut(body.getDateDebut());
        f.setDateFin(body.getDateFin());
        f.setNbreFormesH(body.getNbreFormesH());
        f.setNbreFormesF(body.getNbreFormesF());
        f.setMontantFinancement(body.getMontantFinancement());
        f.setTypeFinancement(body.getTypeFinancement());
        f.setResponsable(body.getResponsable());
        f.setStatut(body.getStatut());
        return ResponseEntity.ok(formationRepository.save(f));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!formationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Formation", "id", id);
        }
        formationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        List<Formation> all = formationRepository.findAll();
        long actives  = all.stream().filter(f -> Formation.StatutFormation.ACTIVE.equals(f.getStatut())).count();
        int totalH    = all.stream().mapToInt(f -> f.getNbreFormesH() != null ? f.getNbreFormesH() : 0).sum();
        int totalF    = all.stream().mapToInt(f -> f.getNbreFormesF() != null ? f.getNbreFormesF() : 0).sum();
        double budget = all.stream().mapToDouble(f -> f.getMontantFinancement() != null ? f.getMontantFinancement() : 0).sum();
        return ResponseEntity.ok(Map.of(
                "total", all.size(), "actives", actives,
                "totalFormesH", totalH, "totalFormesF", totalF,
                "budgetTotal", budget));
    }
}
