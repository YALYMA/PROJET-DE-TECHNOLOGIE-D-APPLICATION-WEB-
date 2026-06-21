import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-insertion',
  standalone: true,
  imports: [
    RouterModule, CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatTabsModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './insertion.component.html',
  styleUrl:    './insertion.component.scss'
})
export class InsertionComponent implements OnInit {
  stages: any[] = [];
  partenaires: any[] = [];
  activeTab = 0;
  loading = false;

  stats = { tauxInsertion: 0, emploiSalarie: 0, autoEmploi: 0, enRecherche: 0 };

  get salariePct() {
    const t = this.stats.emploiSalarie + this.stats.autoEmploi + this.stats.enRecherche;
    return t ? (this.stats.emploiSalarie / t) * 100 : 0;
  }
  get autoEmploiPct() {
    const t = this.stats.emploiSalarie + this.stats.autoEmploi + this.stats.enRecherche;
    return t ? (this.stats.autoEmploi / t) * 100 : 0;
  }

  stagesColumns = ['etudiant', 'entreprise', 'periode', 'type', 'bilan'];

  constructor(
    private router: Router,
    private http: HttpClient,
    private errorService: ErrorService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/insertion/stages`).subscribe({
      next: r  => { this.stages = r.data || r; this.loading = false; },
      error: (err: HttpErrorResponse) => { this.loading = false; this.errorService.handle(err); }
    });
    this.http.get<any>(`${environment.apiUrl}/insertion/partenaires`).subscribe({
      next: r  => this.partenaires = r.data || r,
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });
    this.http.get<any>(`${environment.apiUrl}/insertion/stats`).subscribe({
      next: r  => this.stats = r.data || r,
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });
  }

  bilanColor(b: string) { return { EXCELLENT: 'success', SATISFAISANT: 'warning', INSUFFISANT: 'danger' }[b] || 'gray'; }
  canEdit() { return ['ADMIN', 'ADMINISTRATIF', 'APPUI_INSERTION'].includes(this.auth.currentUser?.role ?? ''); }
}
