package sn.uck.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "comptes_rendus")
@EntityListeners(AuditingEntityListener.class)
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CompteRendu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeDocument type;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 150)
    private String auteur;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @Column(name = "fichier_url")
    private String fichierUrl;

    @Column(name = "role_cible", length = 50)
    private String roleCible; // ALL, ADMIN, ENSEIGNANT, ETUDIANT, etc.

    @Column(nullable = false)
    @Builder.Default
    private Boolean publie = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TypeDocument {
        REUNION, CONSEIL_UNIVERSITE, CIRCULAIRE, SEMINAIRE,
        WEBINAIRE, NOTE_SERVICE, NOTE_ADMINISTRATIVE
    }
}
