import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatTabsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule,
    MatProgressBarModule, MatChipsModule, MatProgressSpinnerModule
  ],
  templateUrl: './admin.component.html',
  styleUrl:    './admin.component.scss'
})
export class AdminComponent implements OnInit {
  courriers: any[] = [];
  personnel: any[] = [];
  budget: any = { previsionnel: 0, realise: 0, lignes: [] };
  activeTab = 0;
  showForm = false;
  loading = false;
  saving = false;
  courrierForm!: FormGroup;

  courrierColumns  = ['reference', 'objet', 'type', 'date', 'statut'];
  personnelColumns = ['matricule', 'nom', 'poste', 'departement', 'dateEntree', 'actif'];

  // Statistiques RH — alimentées par /api/admin/personnel
  rhStats: { icon: string; label: string; value: number }[] = [
    { icon: 'people',               label: 'Personnel total', value: 0 },
    { icon: 'school',               label: 'Enseignants',     value: 0 },
    { icon: 'admin_panel_settings', label: 'Administratifs',  value: 0 },
    { icon: 'support_agent',        label: 'Tuteurs',         value: 0 },
  ];

  get tauxExec(): number {
    return this.budget.previsionnel
      ? Math.round((this.budget.realise / this.budget.previsionnel) * 100)
      : 0;
  }

  lignePct(montant: number): number {
    return this.budget.previsionnel
      ? Math.round((montant / this.budget.previsionnel) * 100)
      : 0;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private notif: NotificationService,
    private errorService: ErrorService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.courrierForm = this.fb.group({
      reference:    ['', Validators.required],
      type:         ['COURRIER_ARRIVE'],
      objet:        ['', Validators.required],
      expediteur:   [''],
      destinataire: [''],
      date:         [new Date().toISOString().split('T')[0]],
      urgent:       [false],
      statut:       ['EN_ATTENTE']
    });
    this.loadAll();
  }

  loadAll() {
    this.loading = true;

    this.http.get<any>(`${environment.apiUrl}/admin/courriers`).subscribe({
      next: r  => { this.courriers = r.data || r; this.loading = false; },
      error: (err: HttpErrorResponse) => { this.loading = false; this.errorService.handle(err); }
    });

    this.http.get<any>(`${environment.apiUrl}/admin/personnel`).subscribe({
      next: r  => {
        this.personnel = r.data || r;
        // Calculer les stats RH depuis la liste du personnel
        this.rhStats[0].value = this.personnel.length;
        this.rhStats[1].value = this.personnel.filter((p: any) =>
          p.poste?.toLowerCase().includes('enseignant') ||
          p.departement?.toLowerCase().includes('enseignement')).length;
        this.rhStats[2].value = this.personnel.filter((p: any) =>
          p.departement?.toLowerCase().includes('admin') ||
          p.departement?.toLowerCase().includes('direction') ||
          p.departement?.toLowerCase().includes('scolarite') ||
          p.departement?.toLowerCase().includes('finance')).length;
        this.rhStats[3].value = this.personnel.filter((p: any) =>
          p.poste?.toLowerCase().includes('tuteur')).length;
      },
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });

    this.http.get<any>(`${environment.apiUrl}/admin/budget`).subscribe({
      next: r  => this.budget = r.data || r,
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });
  }

  saveCourrier() {
    if (this.courrierForm.invalid) return;
    this.saving = true;
    this.http.post(`${environment.apiUrl}/admin/courriers`, this.courrierForm.value).subscribe({
      next: () => {
        this.notif.success('Courrier enregistré ✓');
        this.showForm = false;
        this.saving = false;
        this.loadAll();
      },
      error: (err: HttpErrorResponse) => { this.errorService.handle(err); this.saving = false; }
    });
  }

  typeLabel(t: string): string {
    return ({ COURRIER_ARRIVE: 'Arrivée', COURRIER_DEPART: 'Départ',
              NOTE_SERVICE: 'Note service', CIRCULAIRE: 'Circulaire' } as any)[t] || t;
  }

  statutColor(s: string): string {
    return ({ TRAITE: 'success', EN_ATTENTE: 'warning', ARCHIVE: 'gray' } as any)[s] || 'gray';
  }

  canManage(): boolean {
    return ['ADMIN', 'ADMINISTRATIF'].includes(this.auth.currentUser?.role ?? '');
  }
}
