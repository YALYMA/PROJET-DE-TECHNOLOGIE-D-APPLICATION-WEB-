-- ============================================================
-- UNCHK Schema base de donnees MySQL 8+
-- ============================================================

CREATE TABLE IF NOT EXISTS utilisateurs (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom        VARCHAR(50)  NOT NULL,
    prenom     VARCHAR(50)  NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('ADMIN','ADMINISTRATIF','ENSEIGNANT','ENSEIGNANT_ASSOCIE',
                    'RESPONSABLE_FORMATION','TUTEUR','ETUDIANT','APPUI_INSERTION') NOT NULL,
    photo_url  VARCHAR(255),
    actif      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS etudiants (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    ine               VARCHAR(15)  NOT NULL UNIQUE,
    nom               VARCHAR(50)  NOT NULL,
    prenom            VARCHAR(50)  NOT NULL,
    date_naissance    DATE,
    email             VARCHAR(100) NOT NULL UNIQUE,
    telephone         VARCHAR(20),
    formation         VARCHAR(100) NOT NULL,
    promo             VARCHAR(50),
    annee_debut       INT,
    annee_sortie      INT,
    statut            ENUM('ACTIF','DIPLOME','ABANDON') NOT NULL DEFAULT 'ACTIF',
    genre             ENUM('M','F') NOT NULL,
    diplomes          TEXT,
    autres_formations TEXT,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS formations (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom                 VARCHAR(150) NOT NULL,
    type                VARCHAR(50),
    niveau              VARCHAR(20),
    date_debut          DATE,
    date_fin            DATE,
    nbre_formes_h       INT DEFAULT 0,
    nbre_formes_f       INT DEFAULT 0,
    montant_financement DOUBLE,
    type_financement    VARCHAR(50),
    responsable         VARCHAR(150),
    description         TEXT,
    statut              ENUM('ACTIVE','TERMINEE','SUSPENDUE') NOT NULL DEFAULT 'ACTIVE',
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS formateurs (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    matricule         VARCHAR(20)  NOT NULL UNIQUE,
    nom               VARCHAR(50)  NOT NULL,
    prenom            VARCHAR(50)  NOT NULL,
    email             VARCHAR(100) NOT NULL UNIQUE,
    telephone         VARCHAR(20),
    type              ENUM('ENSEIGNANT','ENSEIGNANT_ASSOCIE','RESPONSABLE_FORMATION','TUTEUR') NOT NULL,
    specialite        VARCHAR(100),
    heures_max        INT DEFAULT 192,
    heures_effectuees INT DEFAULT 0,
    statut            ENUM('ACTIF','INACTIF','CONGE') NOT NULL DEFAULT 'ACTIF',
    bio               TEXT,
    photo_url         VARCHAR(255),
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comptes_rendus (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre       VARCHAR(200) NOT NULL,
    type        ENUM('REUNION','CONSEIL_UNIVERSITE','CIRCULAIRE','SEMINAIRE',
                     'WEBINAIRE','NOTE_SERVICE','NOTE_ADMINISTRATIVE') NOT NULL,
    date        DATE NOT NULL,
    auteur      VARCHAR(150) NOT NULL,
    contenu     TEXT NOT NULL,
    fichier_url VARCHAR(255),
    role_cible  VARCHAR(50) DEFAULT 'ALL',
    publie      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stages (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    etudiant     VARCHAR(100) NOT NULL,
    formation    VARCHAR(100),
    entreprise   VARCHAR(100) NOT NULL,
    date_debut   DATE,
    date_fin     DATE,
    type         VARCHAR(80),
    bilan        ENUM('EN_COURS','EXCELLENT','SATISFAISANT','INSUFFISANT') DEFAULT 'EN_COURS',
    observations TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partenaires (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom            VARCHAR(100) NOT NULL,
    secteur        VARCHAR(100),
    type           VARCHAR(50),
    stages_offerts INT DEFAULT 0,
    contact        VARCHAR(200),
    actif          BOOLEAN DEFAULT TRUE,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS courriers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference    VARCHAR(30) NOT NULL UNIQUE,
    type         ENUM('COURRIER_ARRIVE','COURRIER_DEPART','NOTE_SERVICE','CIRCULAIRE') NOT NULL DEFAULT 'COURRIER_ARRIVE',
    objet        VARCHAR(200) NOT NULL,
    expediteur   VARCHAR(100),
    destinataire VARCHAR(100),
    date         DATE NOT NULL,
    urgent       BOOLEAN DEFAULT FALSE,
    statut       ENUM('EN_ATTENTE','TRAITE','ARCHIVE') DEFAULT 'EN_ATTENTE',
    notes        TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS personnel (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    matricule    VARCHAR(20) NOT NULL UNIQUE,
    nom          VARCHAR(100) NOT NULL,
    poste        VARCHAR(100) NOT NULL,
    departement  VARCHAR(60),
    date_entree  DATE,
    actif        BOOLEAN DEFAULT TRUE,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DONNEES INITIALES
-- Mot de passe : BCrypt de "admin123"
-- Hash BCrypt de "admin123" (genere avec bcrypt rounds=10)
-- ============================================================

INSERT IGNORE INTO utilisateurs (nom, prenom, email, password, role) VALUES
('DIALLO',  'Mamadou',  'admin@unchk.edu.sn',      '$2b$10$05iAzva4R.ipimTS4mb8CuZalY41QK73LF6hgIrPa1Zb5qBDnbsnq', 'ADMIN'),
('FALL',    'Aissatou', 'etudiant@unchk.edu.sn',   '$2b$10$71ZVyFDK1BcR7VcGOxIs3OMcGRxHYd3d98r43CpYh/TakbzYjQQr.', 'ETUDIANT'),
('NDIAYE',  'Ibrahima', 'enseignant@unchk.edu.sn', '$2b$10$UUk3PcC0zfRBbj80wpmnsetXbir7vtRcx1YAieCMzRka4tNOS2jhm', 'ENSEIGNANT'),
('SOW',     'Fatou',    'admin2@unchk.edu.sn',     '$2b$10$sikNfhAKH0P2fvHQWh1CSuSpQB5pKPaeoYg68EZNuV59ZpDs6Kwzq', 'ADMINISTRATIF');

INSERT IGNORE INTO formations (nom, type, niveau, statut, nbre_formes_h, nbre_formes_f) VALUES
('Master Informatique et Systemes', 'DIPLOMANTE', 'Bac+5', 'ACTIVE',   28, 12),
('Licence Gestion des Entreprises', 'INITIALE',   'Bac+3', 'ACTIVE',   45, 35),
('DUT Informatique',                'INITIALE',   'Bac+2', 'ACTIVE',   32, 18),
('Formation Continue Leadership',   'CONTINUE',   'Pro',   'TERMINEE', 18, 22),
('Certificat Digital Marketing',    'CERTIFIANTE','Bac+2', 'ACTIVE',   15, 25);

INSERT IGNORE INTO formateurs (matricule, nom, prenom, email, type, specialite, heures_max, heures_effectuees, statut) VALUES
('ENS001', 'NDIAYE',  'Ibrahima',  'i.ndiaye@unchk.edu.sn',  'ENSEIGNANT',            'Informatique et Systemes',    120, 87, 'ACTIF'),
('ENS002', 'FALL',    'Aminata',   'a.fall@unchk.edu.sn',    'ENSEIGNANT',            'Mathematiques appliquees',    100, 65, 'ACTIF'),
('EA001',  'SOW',     'Ousmane',   'o.sow@unchk.edu.sn',     'ENSEIGNANT_ASSOCIE',    'Gestion de projet',            60, 42, 'ACTIF'),
('TUT001', 'DIALLO',  'Fatoumata', 'f.diallo@unchk.edu.sn',  'TUTEUR',                'Accompagnement pedagogique',   80, 55, 'ACTIF'),
('RF001',  'BA',      'Cheikh',    'c.ba@unchk.edu.sn',      'RESPONSABLE_FORMATION', 'Administration academique',    40, 30, 'ACTIF');

INSERT IGNORE INTO etudiants (ine, nom, prenom, email, formation, promo, statut, genre) VALUES
('UNCHK2023001', 'DIALLO', 'Mamadou',  'mamadou.diallo@unchk.edu.sn',  'Master Informatique et Systemes', '2023', 'ACTIF',   'M'),
('UNCHK2023002', 'FALL',   'Aissatou', 'aissatou.fall@unchk.edu.sn',   'Licence Gestion des Entreprises', '2023', 'ACTIF',   'F'),
('UNCHK2022001', 'NDIAYE', 'Ibrahima', 'ibrahima.ndiaye@unchk.edu.sn', 'Master Informatique et Systemes', '2022', 'DIPLOME', 'M'),
('UNCHK2024001', 'KANE',   'Amadou',   'amadou.kane@unchk.edu.sn',     'Licence Gestion des Entreprises', '2024', 'ACTIF',   'M'),
('UNCHK2023003', 'SARR',   'Mariama',  'mariama.sarr@unchk.edu.sn',    'DUT Informatique',                '2023', 'ACTIF',   'F');

INSERT IGNORE INTO stages (etudiant, formation, entreprise, date_debut, date_fin, type, bilan) VALUES
('DIALLO Mamadou',  'Master Informatique', 'Orange Senegal', '2025-07-01', '2025-12-31', 'Fin d''etudes',    'EXCELLENT'),
('FALL Aissatou',   'Licence Gestion',     'SONATEL',        '2025-06-01', '2025-08-31', 'Perfectionnement', 'SATISFAISANT'),
('NDIAYE Ibrahima', 'Master Informatique', 'GIZ Senegal',    '2024-09-01', '2025-02-28', 'Fin d''etudes',    'EXCELLENT');

INSERT IGNORE INTO partenaires (nom, secteur, type, stages_offerts, actif) VALUES
('Orange Senegal',      'Telecommunications',         'ENTREPRISE',  15, TRUE),
('SONATEL',             'Telecommunications',         'ENTREPRISE',  10, TRUE),
('GIZ Senegal',         'Cooperation internationale', 'ONG',          5, TRUE),
('BHS Banque',          'Banque et Finance',          'ENTREPRISE',   8, TRUE),
('Ministere Education', 'Secteur public',             'INSTITUTION', 12, TRUE);

INSERT IGNORE INTO comptes_rendus (titre, type, date, auteur, contenu, role_cible, publie) VALUES
('Reunion de rentree 2025-2026',       'REUNION',    '2025-10-05', 'Direction UNCHK', 'Reunion de rentree avec enseignants et personnel.',       'ALL',      TRUE),
('Circulaire n12 Calendrier examens',  'CIRCULAIRE', '2025-11-15', 'Scolarite',       'Calendrier des examens du premier semestre disponible.',  'ETUDIANT', TRUE),
('Seminaire Innovation Pedagogique',   'SEMINAIRE',  '2025-12-02', 'Prof. NDIAYE I.', 'Seminaire sur le numerique educatif.',                    'ALL',      TRUE);

INSERT IGNORE INTO courriers (reference, type, objet, expediteur, date, statut, urgent) VALUES
('CA-2026-001', 'COURRIER_ARRIVE', 'Demande de partenariat pedagogique UCAD', 'UCAD',             '2026-01-15', 'TRAITE',     FALSE),
('CD-2026-002', 'COURRIER_DEPART', 'Rapport activites annuel 2025',           'Direction UNCHK',  '2026-02-01', 'TRAITE',     FALSE),
('NS-2026-003', 'NOTE_SERVICE',    'Protocole sanitaire Salle examen',        'Administration',   '2026-03-10', 'EN_ATTENTE', TRUE);

INSERT IGNORE INTO personnel (matricule, nom, poste, departement, date_entree, actif) VALUES
('ADM001', 'DIOP Rokhaya',  'Directrice Academique', 'Direction',    '2018-09-01', TRUE),
('ADM002', 'KANE Amadou',   'Responsable Scolarite', 'Scolarite',    '2019-01-15', TRUE),
('ADM003', 'MBAYE Sokhna',  'Comptable',             'Finance',      '2020-04-01', TRUE),
('ADM004', 'THIAM Babacar', 'Technicien IT',         'Informatique', '2021-07-01', TRUE);
