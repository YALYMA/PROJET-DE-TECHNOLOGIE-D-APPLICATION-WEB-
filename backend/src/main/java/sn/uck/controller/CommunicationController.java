package sn.uck.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uck.entity.CompteRendu;
import sn.uck.exception.ResourceNotFoundException;
import sn.uck.repository.CompteRenduRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communication")
@RequiredArgsConstructor
public class CommunicationController {

    private final CompteRenduRepository compteRenduRepository;

    /** GET /api/communication — liste tous les documents (filtre optionnel par type) */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(required = false) String type) {

        List<CompteRendu> list;
        if (type != null && !type.isBlank()) {
            try {
                list = compteRenduRepository.findByTypeOrderByDateDesc(
                        CompteRendu.TypeDocument.valueOf(type.toUpperCase()));
            } catch (IllegalArgumentException e) {
                list = compteRenduRepository.findAll();
            }
        } else {
            list = compteRenduRepository.findAll();
        }
        return ResponseEntity.ok(Map.of("data", list, "total", list.size()));
    }

    /** GET /api/communication/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<CompteRendu> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                compteRenduRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("CompteRendu", "id", id)));
    }

    /** POST /api/communication */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','RESPONSABLE_FORMATION')")
    public ResponseEntity<CompteRendu> create(@RequestBody CompteRendu cr) {
        if (cr.getPublie() == null) cr.setPublie(false);
        return ResponseEntity.status(201).body(compteRenduRepository.save(cr));
    }

    /** PUT /api/communication/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF','RESPONSABLE_FORMATION')")
    public ResponseEntity<CompteRendu> update(@PathVariable Long id,
                                              @RequestBody CompteRendu body) {
        CompteRendu cr = compteRenduRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompteRendu", "id", id));
        cr.setTitre(body.getTitre());
        cr.setType(body.getType());
        cr.setDate(body.getDate());
        cr.setContenu(body.getContenu());
        cr.setAuteur(body.getAuteur());
        cr.setPublie(body.getPublie() != null ? body.getPublie() : cr.getPublie());
        cr.setRoleCible(body.getRoleCible());
        return ResponseEntity.ok(compteRenduRepository.save(cr));
    }

    /** DELETE /api/communication/{id} */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATIF')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!compteRenduRepository.existsById(id))
            throw new ResourceNotFoundException("CompteRendu", "id", id);
        compteRenduRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** PATCH /api/communication/{id}/lu — marquer comme lu */
    @PatchMapping("/{id}/lu")
    public ResponseEntity<CompteRendu> marquerLu(@PathVariable Long id) {
        CompteRendu cr = compteRenduRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompteRendu", "id", id));
        cr.setPublie(true);
        return ResponseEntity.ok(compteRenduRepository.save(cr));
    }
}
