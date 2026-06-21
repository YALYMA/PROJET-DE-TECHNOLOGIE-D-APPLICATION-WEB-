import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSelectModule, MatChipsModule,
    MatTooltipModule, MatMenuModule, MatProgressSpinnerModule
  ],
  templateUrl: './students.component.html',
  styleUrl:    './students.component.scss'
})
export class StudentsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['ine', 'nom', 'formation', 'promo', 'statut', 'genre', 'actions'];
  dataSource = new MatTableDataSource<any>();
  loading = false;
  showForm = false;
  editMode = false;
  saving = false;
  studentForm!: FormGroup;

  stats = [
    { label: 'Total étudiants', value: '—', icon: 'school', color: 'blue' },
    { label: 'Actifs', value: '—', icon: 'check_circle', color: 'green' },
    { label: 'Diplômés', value: '—', icon: 'workspace_premium', color: 'orange' },
    { label: 'Taux féminisation', value: '—', icon: 'woman', color: 'purple' },
  ];

  formations: string[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private notif: NotificationService,
    private errorService: ErrorService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadFormations();
    this.loadStudents();
  }

  buildForm() {
    this.studentForm = this.fb.group({
      ine:           ['', Validators.required],
      nom:           ['', Validators.required],
      prenom:        ['', Validators.required],
      email:         ['', [Validators.required, Validators.email]],
      telephone:     [''],
      formation:     ['', Validators.required],
      promo:         ['', Validators.required],
      genre:         ['M', Validators.required],
      statut:        ['ACTIF'],
      dateNaissance: [''],
    });
  }

  loadFormations() {
    this.http.get<any>(`${environment.apiUrl}/formations`).subscribe({
      next: r => this.formations = (r.data || r).map((f: any) => f.nom),
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });
  }

  loadStudents() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/students`).subscribe({
      next: r => { this.setData(r.data || r); this.loading = false; },
      error: (err: HttpErrorResponse) => { this.loading = false; this.errorService.handle(err); }
    });
  }

  setData(data: any[]) {
    this.dataSource.data = data;
    setTimeout(() => { this.dataSource.paginator = this.paginator; this.dataSource.sort = this.sort; });
    const actifs   = data.filter(s => s.statut === 'ACTIF').length;
    const diplomes = data.filter(s => s.statut === 'DIPLOME').length;
    const femmes   = data.filter(s => s.genre === 'F').length;
    this.stats[0].value = String(data.length);
    this.stats[1].value = String(actifs);
    this.stats[2].value = String(diplomes);
    this.stats[3].value = data.length ? Math.round((femmes / data.length) * 100) + '%' : '—';
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  openForm(student?: any) {
    this.editMode = !!student;
    this.showForm = true;
    if (student) this.studentForm.patchValue(student);
    else this.studentForm.reset({ genre: 'M', statut: 'ACTIF' });
  }

  closeForm() { this.showForm = false; }

  save() {
    if (this.studentForm.invalid) { this.studentForm.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.studentForm.value;
    const req = this.editMode
      ? this.http.put(`${environment.apiUrl}/students/${val.ine}`, val)
      : this.http.post(`${environment.apiUrl}/students`, val);
    req.subscribe({
      next: () => {
        this.notif.success(this.editMode ? 'Étudiant modifié ✓' : 'Étudiant ajouté ✓');
        this.closeForm();
        this.loadStudents();
        this.saving = false;
      },
      error: (err: HttpErrorResponse) => { this.errorService.handle(err); this.saving = false; }
    });
  }

  delete(id: number | string) {
    if (!confirm('Supprimer cet étudiant définitivement ?')) return;
    this.http.delete(`${environment.apiUrl}/students/${id}`).subscribe({
      next: () => { this.notif.success('Étudiant supprimé'); this.loadStudents(); },
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });
  }

  exportPdf()   { window.open(`${environment.apiUrl}/students/export/pdf`,   '_blank'); }
  exportExcel() { window.open(`${environment.apiUrl}/students/export/excel`, '_blank'); }

  canEdit() { return ['ADMIN', 'ADMINISTRATIF', 'RESPONSABLE_FORMATION'].includes(this.auth.currentUser?.role ?? ''); }
  statutColor(s: string) { return { ACTIF: 'success', DIPLOME: 'info', ABANDON: 'danger' }[s] || 'gray'; }
}
