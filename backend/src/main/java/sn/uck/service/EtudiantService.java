package sn.uck.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uck.entity.Etudiant;
import sn.uck.exception.ResourceNotFoundException;
import sn.uck.repository.EtudiantRepository;

import com.itextpdf.text.Font;
import com.itextpdf.text.BaseColor;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;

    public List<Etudiant> findAll(String formation, String statut, String genre, String search) {
        return etudiantRepository.findAll().stream()
            .filter(e -> formation == null || formation.isBlank() || e.getFormation().equals(formation))
            .filter(e -> statut   == null || statut.isBlank()    || e.getStatut().name().equals(statut))
            .filter(e -> genre    == null || genre.isBlank()     || e.getGenre().name().equals(genre))
            .filter(e -> {
                if (search == null || search.isBlank()) return true;
                String q = search.toLowerCase();
                return e.getNom().toLowerCase().contains(q)
                    || e.getPrenom().toLowerCase().contains(q)
                    || e.getIne().toLowerCase().contains(q)
                    || e.getEmail().toLowerCase().contains(q);
            })
            .toList();   // .toList() Java 16+ — pas besoin de Collectors
    }

    public Etudiant findById(Long id) {
        return etudiantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Etudiant", "id", id));
    }

    public Etudiant findByIne(String ine) {
        return etudiantRepository.findByIne(ine)
            .orElseThrow(() -> new ResourceNotFoundException("Etudiant", "ine", ine));
    }

    public Etudiant create(Etudiant etudiant) {
        if (etudiantRepository.existsByIne(etudiant.getIne()))
            throw new IllegalArgumentException("INE déjà utilisé : " + etudiant.getIne());
        if (etudiantRepository.existsByEmail(etudiant.getEmail()))
            throw new IllegalArgumentException("Email déjà utilisé");
        return etudiantRepository.save(etudiant);
    }

    public Etudiant update(Long id, Etudiant updated) {
        Etudiant e = findById(id);
        e.setNom(updated.getNom());
        e.setPrenom(updated.getPrenom());
        e.setEmail(updated.getEmail());
        e.setTelephone(updated.getTelephone());
        e.setFormation(updated.getFormation());
        e.setPromo(updated.getPromo());
        e.setStatut(updated.getStatut());
        e.setGenre(updated.getGenre());
        e.setDateNaissance(updated.getDateNaissance());
        e.setAnneeDebut(updated.getAnneeDebut());
        e.setAnneeSortie(updated.getAnneeSortie());
        return etudiantRepository.save(e);
    }

    public void delete(Long id) {
        if (!etudiantRepository.existsById(id))
            throw new ResourceNotFoundException("Etudiant", "id", id);
        etudiantRepository.deleteById(id);
    }

    // ── Export PDF ──────────────────────────────────────────────────────────────
    public byte[] exportPdf() {
        try {
            List<Etudiant> etudiants = etudiantRepository.findAll();
            Document document = new Document(PageSize.A4.rotate());
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            // Titre
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.DARK_GRAY);
            Paragraph title = new Paragraph("Université Numérique Cheikh Hamidou Kane — Liste des Étudiants", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Tableau 6 colonnes
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2f, 2.5f, 2.5f, 3.5f, 1.5f, 1.5f});

            BaseColor headerBg = new BaseColor(13, 33, 55);   // --unchk-navy
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

            for (String h : new String[]{"INE", "Nom", "Prénom", "Formation", "Promo", "Statut"}) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(headerBg);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            Font dataFont = new Font(Font.FontFamily.HELVETICA, 9);
            boolean alt = false;
            for (Etudiant e : etudiants) {
                BaseColor rowBg = alt ? new BaseColor(240, 244, 248) : BaseColor.WHITE;
                for (String val : new String[]{
                        e.getIne(), e.getNom(), e.getPrenom(),
                        e.getFormation(),
                        e.getPromo() != null ? e.getPromo() : "",
                        e.getStatut().name()}) {
                    PdfPCell cell = new PdfPCell(new Phrase(val, dataFont));
                    cell.setBackgroundColor(rowBg);
                    cell.setPadding(5);
                    table.addCell(cell);
                }
                alt = !alt;
            }

            document.add(table);
            document.close();
            return out.toByteArray();

        } catch (Exception ex) {
            throw new RuntimeException("Erreur lors de la génération du PDF", ex);
        }
    }

    // ── Export Excel ────────────────────────────────────────────────────────────
    public byte[] exportExcel() {
        try (Workbook workbook = new XSSFWorkbook()) {
            List<Etudiant> etudiants = etudiantRepository.findAll();
            Sheet sheet = workbook.createSheet("Étudiants");

            // Style entêtes
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] cols = {"ID", "INE", "Nom", "Prénom", "Email", "Téléphone", "Formation", "Promo", "Statut", "Genre"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < cols.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Etudiant e : etudiants) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(e.getId());
                row.createCell(1).setCellValue(e.getIne());
                row.createCell(2).setCellValue(e.getNom());
                row.createCell(3).setCellValue(e.getPrenom());
                row.createCell(4).setCellValue(e.getEmail());
                row.createCell(5).setCellValue(e.getTelephone() != null ? e.getTelephone() : "");
                row.createCell(6).setCellValue(e.getFormation());
                row.createCell(7).setCellValue(e.getPromo() != null ? e.getPromo() : "");
                row.createCell(8).setCellValue(e.getStatut().name());
                row.createCell(9).setCellValue(e.getGenre().name());
            }

            // Ajustement automatique de la largeur des colonnes
            for (int i = 0; i < cols.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (Exception ex) {
            throw new RuntimeException("Erreur lors de la génération du fichier Excel", ex);
        }
    }
}
