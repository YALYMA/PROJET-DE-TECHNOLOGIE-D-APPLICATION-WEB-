package sn.uck.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stages")
@EntityListeners(AuditingEntityListener.class)
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Stage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String etudiant;       // nom complet étudiant

    @Column(length = 100)
    private String formation;

    @Column(nullable = false, length = 100)
    private String entreprise;

    @Column(name = "date_debut")
    private LocalDate debut;

    @Column(name = "date_fin")
    private LocalDate fin;

    @Column(length = 80)
    private String type;           // "Fin d'études", "Perfectionnement", etc.

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BilanStage bilan = BilanStage.EN_COURS;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum BilanStage { EN_COURS, EXCELLENT, SATISFAISANT, INSUFFISANT }
}
