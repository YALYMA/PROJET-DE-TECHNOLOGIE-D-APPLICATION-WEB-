package sn.uck.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uck.entity.Partenaire;
import sn.uck.entity.Stage;
import sn.uck.exception.ResourceNotFoundException;
import sn.uck.repository.PartenaireRepository;
import sn.uck.repository.StageRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/insertion")
@RequiredArgsConstructor
public class InsertionController {

    private final StageRepository stageRepository;
    private final PartenaireRepository partenaireRepository;

    // ── Stages ──────────────────────────────────────────────

    @GetMapping("/stages")
    public ResponseEntity<Map<String, Object>> getStages() {
        var list = stageRepository.findAll();
        return ResponseEntity.ok(Map.of("data", list, "total", list.size()));
    }

    @GetMapping("/stages/{id}")
    public ResponseEntity<Stage> getStageById(@PathVariable Long id) {
        return ResponseEntity.ok(stageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stage", "id", id)));
    }

    @PostMapping("/stages")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','APPUI_INSERTION')")
    public ResponseEntity<Stage> createStage(@RequestBody Stage stage) {
        return ResponseEntity.status(201).body(stageRepository.save(stage));
    }

    @PutMapping("/stages/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','APPUI_INSERTION')")
    public ResponseEntity<Stage> updateStage(@PathVariable Long id, @RequestBody Stage body) {
        Stage s = stageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stage", "id", id));
        s.setEtudiant(body.getEtudiant());
        s.setFormation(body.getFormation());
        s.setEntreprise(body.getEntreprise());
        s.setDebut(body.getDebut());
        s.setFin(body.getFin());
        s.setType(body.getType());
        s.setBilan(body.getBilan());
        s.setObservations(body.getObservations());
        return ResponseEntity.ok(stageRepository.save(s));
    }

    @DeleteMapping("/stages/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Void> deleteStage(@PathVariable Long id) {
        if (!stageRepository.existsById(id))
            throw new ResourceNotFoundException("Stage", "id", id);
        stageRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Partenaires ──────────────────────────────────────────

    @GetMapping("/partenaires")
    public ResponseEntity<Map<String, Object>> getPartenaires() {
        var list = partenaireRepository.findAll();
        return ResponseEntity.ok(Map.of("data", list, "total", list.size()));
    }

    @PostMapping("/partenaires")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','APPUI_INSERTION')")
    public ResponseEntity<Partenaire> createPartenaire(@RequestBody Partenaire partenaire) {
        // Valeurs par défaut sur les Boolean nullable
        if (partenaire.getActif() == null) partenaire.setActif(true);
        return ResponseEntity.status(201).body(partenaireRepository.save(partenaire));
    }

    @PutMapping("/partenaires/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','APPUI_INSERTION')")
    public ResponseEntity<Partenaire> updatePartenaire(@PathVariable Long id,
                                                       @RequestBody Partenaire body) {
        Partenaire p = partenaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partenaire", "id", id));
        p.setNom(body.getNom());
        p.setSecteur(body.getSecteur());
        p.setType(body.getType());
        p.setStagesOfferts(body.getStagesOfferts() != null ? body.getStagesOfferts() : 0);
        p.setContact(body.getContact());
        p.setActif(body.getActif() != null ? body.getActif() : p.getActif());
        return ResponseEntity.ok(partenaireRepository.save(p));
    }

    // ── Stats insertion ──────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> insertionStats() {
        long total        = stageRepository.count();
        long excellent    = stageRepository.findByBilan(Stage.BilanStage.EXCELLENT).size();
        long satisfaisant = stageRepository.findByBilan(Stage.BilanStage.SATISFAISANT).size();
        long insuffisant  = stageRepository.findByBilan(Stage.BilanStage.INSUFFISANT).size();
        long enCours      = stageRepository.findByBilan(Stage.BilanStage.EN_COURS).size();
        double taux = total > 0
                ? Math.round(((double) (excellent + satisfaisant) / total) * 1000.0) / 10.0
                : 0.0;
        return ResponseEntity.ok(Map.of(
                "tauxInsertion", taux,
                "emploiSalarie", excellent,
                "autoEmploi",    satisfaisant,
                "enRecherche",   insuffisant + enCours,
                "totalStages",   total
        ));
    }
}
