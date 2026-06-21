import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatTooltipModule, MatProgressSpinnerModule, MatDividerModule
  ],
  templateUrl: './formations.component.html',
  styleUrl:    './formations.component.scss'
})
export class FormationsComponent implements OnInit {
  formations: any[] = [];
  loading = false;
  showForm = false;
  editMode = false;
  saving = false;
  form!: FormGroup;
  searchTerm = '';
  filterType = '';
  filterStatut = '';

  stats = [
    { label: 'Formations', value: '—', icon: 'school', color: 'blue' },
    { label: 'En cours', value: '—', icon: 'trending_up', color: 'green' },
    { label: 'Étudiants formés', value: '—', icon: 'people', color: 'orange' },
    { label: 'Budget total', value: '—', icon: 'payments', color: 'purple' },
  ];

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
    this.loadFormations();
  }

  buildForm() {
    this.form = this.fb.group({
      nom:                ['', Validators.required],
      type:               ['INITIALE', Validators.required],
      niveau:             [''],
      dateDebut:          [''],
      dateFin:            [''],
      nbreFormesH:        [0],
      nbreFormesF:        [0],
      montantFinancement: [0],
      typeFinancement:    ['PUBLIC'],
      statut:             ['ACTIVE'],
    });
  }

  loadFormations() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/formations`).subscribe({
      next: r => { this.formations = r.data || r; this.buildStats(); this.loading = false; },
      error: (err: HttpErrorResponse) => { this.loading = false; this.errorService.handle(err); }
    });
  }

  buildStats() {
    const actives = this.formations.filter(f => f.statut === 'ACTIVE').length;
    const total   = this.formations.reduce((s, f) => s + (f.nbreFormesH || 0) + (f.nbreFormesF || 0), 0);
    const budget  = this.formations.reduce((s, f) => s + (f.montantFinancement || 0), 0);
    this.stats[0].value = String(this.formations.length);
    this.stats[1].value = String(actives);
    this.stats[2].value = String(total);
    this.stats[3].value = budget ? (budget / 1000000).toFixed(1) + 'M FCFA' : '0 FCFA';
  }

  get filtered() {
    return this.formations.filter(f =>
      (!this.searchTerm   || f.nom.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.filterType   || f.type === this.filterType) &&
      (!this.filterStatut || f.statut === this.filterStatut)
    );
  }

  openForm(f?: any) {
    this.editMode = !!f;
    this.showForm = true;
    if (f) this.form.patchValue(f);
    else this.form.reset({ type: 'INITIALE', typeFinancement: 'PUBLIC', statut: 'ACTIVE', nbreFormesH: 0, nbreFormesF: 0, montantFinancement: 0 });
  }

  closeForm() { this.showForm = false; }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value;
    const req = this.editMode
      ? this.http.put(`${environment.apiUrl}/formations/${val.id}`, val)
      : this.http.post(`${environment.apiUrl}/formations`, val);
    req.subscribe({
      next: () => { this.notif.success('Formation enregistrée ✓'); this.closeForm(); this.loadFormations(); this.saving = false; },
      error: (err: HttpErrorResponse) => { this.errorService.handle(err); this.saving = false; }
    });
  }

  delete(id: number) {
    if (!confirm('Supprimer cette formation définitivement ?')) return;
    this.http.delete(`${environment.apiUrl}/formations/${id}`).subscribe({
      next: () => { this.notif.success('Formation supprimée'); this.loadFormations(); },
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });
  }

  canEdit() { return ['ADMIN', 'ADMINISTRATIF', 'RESPONSABLE_FORMATION'].includes(this.auth.currentUser?.role ?? ''); }
  typeColor(t: string) { return { INITIALE: 'info', CONTINUE: 'success', CERTIFIANTE: 'warning', DIPLOMANTE: 'purple' }[t] || 'gray'; }
  statutColor(s: string) { return { ACTIVE: 'success', TERMINEE: 'gray', SUSPENDUE: 'danger' }[s] || 'gray'; }
}
