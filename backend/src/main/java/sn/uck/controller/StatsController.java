package sn.uck.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.uck.entity.Etudiant;
import sn.uck.entity.Stage;
import sn.uck.repository.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final EtudiantRepository etudiantRepository;
    private final FormationRepository formationRepository;
    private final FormateurRepository formateurRepository;
    private final StageRepository stageRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * GET /api/stats
     * Stats globales pour le dashboard (tous rôles).
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> globalStats() {
        long totalEtudiants  = etudiantRepository.count();
        long totalFormations = formationRepository.count();
        long totalFormateurs = formateurRepository.count();
        long actifs          = etudiantRepository.countByStatut(Etudiant.StatutEtudiant.ACTIF);
        long diplomes        = etudiantRepository.countByStatut(Etudiant.StatutEtudiant.DIPLOME);

        long totalStages  = stageRepository.count();
        long excellent    = stageRepository.findByBilan(Stage.BilanStage.EXCELLENT).size();
        long satisfaisant = stageRepository.findByBilan(Stage.BilanStage.SATISFAISANT).size();
        double taux = totalStages > 0
                ? Math.round(((double)(excellent + satisfaisant) / totalStages) * 1000.0) / 10.0
                : 0.0;

        return ResponseEntity.ok(Map.of(
                "etudiants",   totalEtudiants,
                "formations",  totalFormations,
                "enseignants", totalFormateurs,
                "insertion",   taux + "%",
                "actifs",      actifs,
                "diplomes",    diplomes
        ));
    }

    /**
     * GET /api/stats/activities
     * Dernières activités (5 étudiants récemment inscrits).
     */
    @GetMapping("/activities")
    public ResponseEntity<List<Map<String, Object>>> activities() {
        List<Map<String, Object>> activities = etudiantRepository.findAll().stream()
                .filter(e -> e.getCreatedAt() != null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(e -> Map.<String, Object>of(
                        "icon",  "person_add",
                        "text",  "Étudiant inscrit : " + e.getNom() + " " + e.getPrenom(),
                        "time",  e.getCreatedAt().format(DATE_FMT),
                        "color", "blue"
                ))
                .toList();
        return ResponseEntity.ok(activities);
    }

    /**
     * GET /api/stats/insertion
     * Stats détaillées d'insertion professionnelle.
     */
    @GetMapping("/insertion")
    public ResponseEntity<Map<String, Object>> insertionStats() {
        long total        = stageRepository.count();
        long excellent    = stageRepository.findByBilan(Stage.BilanStage.EXCELLENT).size();
        long satisfaisant = stageRepository.findByBilan(Stage.BilanStage.SATISFAISANT).size();
        long insuffisant  = stageRepository.findByBilan(Stage.BilanStage.INSUFFISANT).size();
        long enCours      = stageRepository.findByBilan(Stage.BilanStage.EN_COURS).size();
        double taux = total > 0
                ? Math.round(((double)(excellent + satisfaisant) / total) * 1000.0) / 10.0
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
