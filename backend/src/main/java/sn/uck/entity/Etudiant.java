package sn.uck.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "etudiants")
@EntityListeners(AuditingEntityListener.class)
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Etudiant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 15)
    private String ine;

    @Column(nullable = false, length = 50)
    private String nom;

    @Column(nullable = false, length = 50)
    private String prenom;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Column(nullable = false, length = 100)
    private String formation;

    @Column(length = 50)
    private String promo;

    @Column(name = "annee_debut")
    private Integer anneeDebut;

    @Column(name = "annee_sortie")
    private Integer anneeSortie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutEtudiant statut = StatutEtudiant.ACTIF;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 1)
    private Genre genre;

    @Column(columnDefinition = "TEXT")
    private String diplomes;

    @Column(name = "autres_formations", columnDefinition = "TEXT")
    private String autresFormations;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum StatutEtudiant { ACTIF, DIPLOME, ABANDON }
    public enum Genre { M, F }
}
