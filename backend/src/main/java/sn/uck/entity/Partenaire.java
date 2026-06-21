package sn.uck.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "partenaires")
@EntityListeners(AuditingEntityListener.class)
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Partenaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 100)
    private String secteur;

    @Column(length = 50)
    private String type;           // ENTREPRISE, ONG, INSTITUTION, etc.

    @Column(name = "stages_offerts")
    @Builder.Default
    private Integer stagesOfferts = 0;

    @Column(length = 200)
    private String contact;

    @Builder.Default
    private Boolean actif = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
