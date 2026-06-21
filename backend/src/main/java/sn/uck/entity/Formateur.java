package sn.uck.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "formateurs")
@EntityListeners(AuditingEntityListener.class)
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Formateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String matricule;

    @Column(nullable = false, length = 50)
    private String nom;

    @Column(nullable = false, length = 50)
    private String prenom;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeFormateur type;

    @Column(length = 100)
    private String specialite;

    @Column(name = "heures_max")
    @Builder.Default
    private Integer heuresMax = 192;

    @Column(name = "heures_effectuees")
    @Builder.Default
    private Integer heuresEffectuees = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutFormateur statut = StatutFormateur.ACTIF;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "photo_url")
    private String photoUrl;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TypeFormateur { ENSEIGNANT, ENSEIGNANT_ASSOCIE, RESPONSABLE_FORMATION, TUTEUR }
    public enum StatutFormateur { ACTIF, INACTIF, CONGE }
}
