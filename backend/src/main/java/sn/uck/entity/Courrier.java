package sn.uck.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "courriers")
@EntityListeners(AuditingEntityListener.class)
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Courrier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TypeCourrier type = TypeCourrier.COURRIER_ARRIVE;

    @Column(nullable = false, length = 200)
    private String objet;

    @Column(length = 100)
    private String expediteur;

    @Column(length = 100)
    private String destinataire;

    @Column(nullable = false)
    private LocalDate date;

    @Builder.Default
    private Boolean urgent = false;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutCourrier statut = StatutCourrier.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TypeCourrier { COURRIER_ARRIVE, COURRIER_DEPART, NOTE_SERVICE, CIRCULAIRE }
    public enum StatutCourrier { EN_ATTENTE, TRAITE, ARCHIVE }
}
