package sn.uck.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "formations")
@EntityListeners(AuditingEntityListener.class)
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nom;

    @Column(length = 50)
    private String type; // Licence, Master, BTS, DUT, Certification

    @Column(length = 20)
    private String niveau; // Bac+2, Bac+3, Bac+5

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "nbre_formes_h")
    @Builder.Default
    private Integer nbreFormesH = 0;

    @Column(name = "nbre_formes_f")
    @Builder.Default
    private Integer nbreFormesF = 0;

    @Column(name = "montant_financement")
    private Double montantFinancement;

    @Column(name = "type_financement", length = 50)
    private String typeFinancement;

    @Column(length = 150)
    private String responsable;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutFormation statut = StatutFormation.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum StatutFormation { ACTIVE, TERMINEE, SUSPENDUE }
}
