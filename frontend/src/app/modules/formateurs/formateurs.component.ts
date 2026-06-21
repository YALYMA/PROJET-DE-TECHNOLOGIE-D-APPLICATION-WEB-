import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-formateurs',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatTooltipModule, MatProgressBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './formateurs.component.html',
  styleUrl:    './formateurs.component.scss'
})
export class FormateursComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['matricule', 'nom', 'type', 'specialite', 'heures', 'statut', 'actions'];
  dataSource = new MatTableDataSource<any>();
  loading = false;
  showForm = false;
  editMode = false;
  saving = false;
  form!: FormGroup;
  typeStats: { label: string; value: number; color: string }[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private notif: NotificationService,
    private errorService: ErrorService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadFormateurs();
  }

  buildForm() {
    this.form = this.fb.group({
      matricule:         ['', Validators.required],
      nom:               ['', Validators.required],
      prenom:            ['', Validators.required],
      email:             ['', [Validators.required, Validators.email]],
      telephone:         [''],
      type:              ['ENSEIGNANT', Validators.required],
      specialite:        [''],
      heuresMax:         [100],
      heuresEffectuees:  [0],
      statut:            ['ACTIF'],
    });
  }

  loadFormateurs() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/formateurs`).subscribe({
      next: r => { this.setData(r.data || r); this.loading = false; },
      error: (err: HttpErrorResponse) => { this.loading = false; this.errorService.handle(err); }
    });
  }

  setData(data: any[]) {
    this.dataSource.data = data;
    setTimeout(() => { this.dataSource.paginator = this.paginator; this.dataSource.sort = this.sort; });
    this.typeStats = [
      { label: 'Enseignants',    value: data.filter(f => f.type === 'ENSEIGNANT').length,             color: 'blue'   },
      { label: 'Associés',       value: data.filter(f => f.type === 'ENSEIGNANT_ASSOCIE').length,     color: 'green'  },
      { label: 'Tuteurs',        value: data.filter(f => f.type === 'TUTEUR').length,                 color: 'orange' },
      { label: 'Responsables',   value: data.filter(f => f.type === 'RESPONSABLE_FORMATION').length,  color: 'purple' },
    ];
  }

  applyFilter(e: Event) {
    this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
  }

  openForm(f?: any) {
    this.editMode = !!f;
    this.showForm = true;
    if (f) this.form.patchValue(f);
    else this.form.reset({ type: 'ENSEIGNANT', statut: 'ACTIF', heuresMax: 100, heuresEffectuees: 0 });
  }

  closeForm() { this.showForm = false; }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value;
    const req = this.editMode
      ? this.http.put(`${environment.apiUrl}/formateurs/${val.id}`, val)
      : this.http.post(`${environment.apiUrl}/formateurs`, val);
    req.subscribe({
      next: () => { this.notif.success('Enregistré ✓'); this.closeForm(); this.loadFormateurs(); this.saving = false; },
      error: (err: HttpErrorResponse) => { this.errorService.handle(err); this.saving = false; }
    });
  }

  delete(id: number) {
    if (!confirm('Supprimer ce formateur définitivement ?')) return;
    this.http.delete(`${environment.apiUrl}/formateurs/${id}`).subscribe({
      next: () => { this.notif.success('Formateur supprimé'); this.loadFormateurs(); },
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });
  }

  heuresPct(f: any) { return Math.min(100, Math.round((f.heuresEffectuees / f.heuresMax) * 100)); }
  typeLabel(t: string) { return { ENSEIGNANT: 'Enseignant', ENSEIGNANT_ASSOCIE: 'Ens. Associé', TUTEUR: 'Tuteur', RESPONSABLE_FORMATION: 'Resp. Formation' }[t] || t; }
  typeColor(t: string) { return { ENSEIGNANT: 'info', ENSEIGNANT_ASSOCIE: 'success', TUTEUR: 'warning', RESPONSABLE_FORMATION: 'purple' }[t] || 'gray'; }
  canEdit() { return ['ADMIN', 'ADMINISTRATIF'].includes(this.auth.currentUser?.role ?? ''); }
}
