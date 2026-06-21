package sn.uck.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uck.entity.Courrier;
import sn.uck.entity.Personnel;
import sn.uck.exception.ResourceNotFoundException;
import sn.uck.repository.CourrierRepository;
import sn.uck.repository.PersonnelRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
public class AdminController {

    private final CourrierRepository courrierRepository;
    private final PersonnelRepository personnelRepository;

    // ── Courriers ────────────────────────────────────────────

    @GetMapping("/courriers")
    public ResponseEntity<Map<String, Object>> getCourriers(
            @RequestParam(required = false) String statut) {
        List<Courrier> list;
        if (statut != null && !statut.isBlank()) {
            try {
                list = courrierRepository.findByStatutOrderByDateDesc(
                        Courrier.StatutCourrier.valueOf(statut.toUpperCase()));
            } catch (IllegalArgumentException e) {
                list = courrierRepository.findAll();
            }
        } else {
            list = courrierRepository.findAll();
        }
        return ResponseEntity.ok(Map.of("data", list, "total", list.size()));
    }

    @PostMapping("/courriers")
    public ResponseEntity<Courrier> createCourrier(@RequestBody Courrier courrier) {
        if (courrierRepository.existsByReference(courrier.getReference())) {
            throw new IllegalArgumentException("Référence déjà utilisée : " + courrier.getReference());
        }
        // Valeur par défaut sur le Boolean nullable
        if (courrier.getUrgent() == null) courrier.setUrgent(false);
        return ResponseEntity.status(201).body(courrierRepository.save(courrier));
    }

    @PutMapping("/courriers/{id}")
    public ResponseEntity<Courrier> updateCourrier(@PathVariable Long id,
                                                   @RequestBody Courrier body) {
        Courrier c = courrierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Courrier", "id", id));
        c.setObjet(body.getObjet());
        c.setType(body.getType());
        c.setExpediteur(body.getExpediteur());
        c.setDestinataire(body.getDestinataire());
        c.setDate(body.getDate());
        c.setUrgent(body.getUrgent() != null ? body.getUrgent() : c.getUrgent());
        c.setStatut(body.getStatut());
        c.setNotes(body.getNotes());
        return ResponseEntity.ok(courrierRepository.save(c));
    }

    @DeleteMapping("/courriers/{id}")
    public ResponseEntity<Void> deleteCourrier(@PathVariable Long id) {
        if (!courrierRepository.existsById(id))
            throw new ResourceNotFoundException("Courrier", "id", id);
        courrierRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Personnel ────────────────────────────────────────────

    @GetMapping("/personnel")
    public ResponseEntity<Map<String, Object>> getPersonnel() {
        List<Personnel> list = personnelRepository.findAll();
        return ResponseEntity.ok(Map.of("data", list, "total", list.size()));
    }

    @PostMapping("/personnel")
    public ResponseEntity<Personnel> createPersonnel(@RequestBody Personnel personnel) {
        if (personnelRepository.existsByMatricule(personnel.getMatricule())) {
            throw new IllegalArgumentException("Matricule déjà utilisé : " + personnel.getMatricule());
        }
        if (personnel.getActif() == null) personnel.setActif(true);
        return ResponseEntity.status(201).body(personnelRepository.save(personnel));
    }

    @PutMapping("/personnel/{id}")
    public ResponseEntity<Personnel> updatePersonnel(@PathVariable Long id,
                                                     @RequestBody Personnel body) {
        Personnel p = personnelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personnel", "id", id));
        p.setNom(body.getNom());
        p.setPoste(body.getPoste());
        p.setDepartement(body.getDepartement());
        p.setDateEntree(body.getDateEntree());
        p.setActif(body.getActif() != null ? body.getActif() : p.getActif());
        return ResponseEntity.ok(personnelRepository.save(p));
    }

    // ── Budget ───────────────────────────────────────────────
    // Données statiques — à remplacer par une entité Budget si besoin

    @GetMapping("/budget")
    public ResponseEntity<Map<String, Object>> getBudget() {
        return ResponseEntity.ok(Map.of(
                "previsionnel", 85_000_000,
                "realise",      62_400_000,
                "lignes", List.of(
                        Map.of("poste", "RH",             "montant", 40_000_000),
                        Map.of("poste", "Pédagogie",      "montant", 20_000_000),
                        Map.of("poste", "Infrastructure", "montant", 15_000_000),
                        Map.of("poste", "Communication",  "montant", 10_000_000)
                )
        ));
    }
}
