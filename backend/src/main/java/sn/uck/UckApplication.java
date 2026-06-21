package sn.uck;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing   // requis pour @CreatedDate et @LastModifiedDate dans les entités
public class UckApplication {
    public static void main(String[] args) {
        SpringApplication.run(UckApplication.class, args);
    }
}
