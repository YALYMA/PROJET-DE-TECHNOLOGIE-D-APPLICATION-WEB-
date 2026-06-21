package sn.uck.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uck.entity.Etudiant;
import sn.uck.service.EtudiantService;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class EtudiantController {

    private final EtudiantService etudiantService;

    @GetMapping
    public ResponseEntity<List<Etudiant>> getAllEtudiants(
            @RequestParam(required = false) String formation,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(etudiantService.findAll(formation, statut, genre, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Etudiant> getById(@PathVariable Long id) {
        return ResponseEntity.ok(etudiantService.findById(id));
    }

    @GetMapping("/ine/{ine}")
    public ResponseEntity<Etudiant> getByIne(@PathVariable String ine) {
        return ResponseEntity.ok(etudiantService.findByIne(ine));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Etudiant> create(@Valid @RequestBody Etudiant etudiant) {
        return ResponseEntity.status(201).body(etudiantService.create(etudiant));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Etudiant> update(@PathVariable Long id,
                                           @Valid @RequestBody Etudiant etudiant) {
        return ResponseEntity.ok(etudiantService.update(id, etudiant));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        etudiantService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<byte[]> exportPdf() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=etudiants.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(etudiantService.exportPdf());
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<byte[]> exportExcel() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=etudiants.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(etudiantService.exportExcel());
    }
}
