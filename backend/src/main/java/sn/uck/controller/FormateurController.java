package sn.uck.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uck.entity.Formateur;
import sn.uck.exception.ResourceNotFoundException;
import sn.uck.repository.FormateurRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formateurs")
@RequiredArgsConstructor
public class FormateurController {

    private final FormateurRepository formateurRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(@RequestParam(required = false) String type) {
        List<Formateur> list;
        if (type != null && !type.isBlank()) {
            try {
                Formateur.TypeFormateur typeEnum = Formateur.TypeFormateur.valueOf(type.toUpperCase());
                list = formateurRepository.findByType(typeEnum);
            } catch (IllegalArgumentException e) {
                list = formateurRepository.findAll();
            }
        } else {
            list = formateurRepository.findAll();
        }
        return ResponseEntity.ok(Map.of("data", list, "total", list.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formateur> getById(@PathVariable Long id) {
        Formateur f = formateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formateur", "id", id));
        return ResponseEntity.ok(f);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Formateur> create(@RequestBody Formateur formateur) {
        if (formateurRepository.existsByMatricule(formateur.getMatricule())) {
            throw new IllegalArgumentException("Matricule déjà utilisé : " + formateur.getMatricule());
        }
        if (formateurRepository.existsByEmail(formateur.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }
        return ResponseEntity.status(201).body(formateurRepository.save(formateur));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Formateur> update(@PathVariable Long id, @RequestBody Formateur body) {
        Formateur f = formateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formateur", "id", id));
        f.setNom(body.getNom());
        f.setPrenom(body.getPrenom());
        f.setEmail(body.getEmail());
        f.setTelephone(body.getTelephone());
        f.setType(body.getType());
        f.setSpecialite(body.getSpecialite());
        f.setHeuresMax(body.getHeuresMax());
        f.setHeuresEffectuees(body.getHeuresEffectuees());
        f.setStatut(body.getStatut());
        return ResponseEntity.ok(formateurRepository.save(f));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!formateurRepository.existsById(id)) {
            throw new ResourceNotFoundException("Formateur", "id", id);
        }
        formateurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
