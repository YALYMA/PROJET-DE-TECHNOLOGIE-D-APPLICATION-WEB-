import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';

interface MenuItem {
  route: string;
  label: string;
  icon: string;
  roles: string[];
  badge?: string;   // ← optionnel
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatCardModule,
    MatBadgeModule, MatTooltipModule, MatMenuModule,
    MatDividerModule, MatChipsModule, MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl:    './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile = false;
  sidenavOpened = true;
  currentUser: any;
  currentTime = new Date();
  loadingStats = false;

  stats: any[] = [];
  activities: any[] = [];

  allMenuItems: MenuItem[] = [
    { route: '/dashboard',     label: 'Tableau de bord', icon: 'dashboard',            roles: ['ALL'] },
    { route: '/students',      label: 'Étudiants',       icon: 'school',               roles: ['ADMIN','ADMINISTRATIF','ENSEIGNANT','TUTEUR','RESPONSABLE_FORMATION'] },
    { route: '/formations',    label: 'Formations',      icon: 'menu_book',            roles: ['ADMIN','ADMINISTRATIF','ENSEIGNANT','RESPONSABLE_FORMATION'] },
    { route: '/formateurs',    label: 'Formateurs',      icon: 'person_pin',           roles: ['ADMIN','ADMINISTRATIF','RESPONSABLE_FORMATION'] },
    { route: '/communication', label: 'Communication',   icon: 'campaign',             roles: ['ALL'] },
    { route: '/insertion',     label: 'Insertion',       icon: 'work',                 roles: ['ADMIN','ADMINISTRATIF','APPUI_INSERTION','ETUDIANT'] },
    { route: '/admin',         label: 'Administration',  icon: 'admin_panel_settings', roles: ['ADMIN','ADMINISTRATIF'] },
  ];

  constructor(
    private authService: AuthService,
    private errorService: ErrorService,
    private http: HttpClient,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(r => {
      this.isMobile = r.matches;
      this.sidenavOpened = !r.matches;
    });
    setInterval(() => this.currentTime = new Date(), 60000);
    this.loadStats();
    this.loadActivities();
  }

  loadStats() {
    this.loadingStats = true;
    this.http.get<any>(`${environment.apiUrl}/stats`).subscribe({
      next: r => {
        const d = r.data || r;
        const role = this.currentUser?.role;
        if (role === 'ETUDIANT') {
          this.stats = [
            { label: 'Ma Formation',     value: d.formation    ?? '—', icon: 'school',         color: 'blue'   },
            { label: 'Modules validés',  value: d.modules      ?? '—', icon: 'task_alt',        color: 'green'  },
            { label: 'Moyenne générale', value: d.moyenne      ?? '—', icon: 'grade',           color: 'orange' },
            { label: 'Absences',         value: d.absences     ?? '—', icon: 'event_busy',      color: 'red'    },
          ];
        } else if (role === 'ENSEIGNANT') {
          this.stats = [
            { label: 'Mes cours',         value: d.cours        ?? '—', icon: 'menu_book',       color: 'blue'   },
            { label: 'Heures enseignées', value: d.heures       ?? '—', icon: 'schedule',        color: 'green'  },
            { label: 'Étudiants suivis',  value: d.etudiants    ?? '—', icon: 'people',          color: 'orange' },
            { label: 'Taux présence',     value: d.tauxPresence ?? '—', icon: 'event_available', color: 'teal'   },
          ];
        } else {
          this.stats = [
            { label: 'Étudiants',       value: d.etudiants  ?? '—', icon: 'school',     color: 'blue'   },
            { label: 'Formations',      value: d.formations ?? '—', icon: 'menu_book',  color: 'green'  },
            { label: 'Enseignants',     value: d.enseignants ?? '—',icon: 'person_pin', color: 'orange' },
            { label: "Taux d'insertion",value: d.insertion  ?? '—', icon: 'work',       color: 'teal'   },
          ];
        }
        this.loadingStats = false;
      },
      error: (err: HttpErrorResponse) => { this.loadingStats = false; this.errorService.handle(err); }
    });
  }

  loadActivities() {
    this.http.get<any>(`${environment.apiUrl}/stats/activities`).subscribe({
      next: r  => this.activities = r.data || r,
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });
  }

  get menuItems(): MenuItem[] {
    const role = this.currentUser?.role || '';
    return this.allMenuItems.filter(i => i.roles.includes('ALL') || i.roles.includes(role));
  }

  getInitials(): string {
    const u = this.currentUser;
    if (!u) return '?';
    return `${(u.prenom || '')[0] || ''}${(u.nom || '')[0] || ''}`.toUpperCase();
  }

  getRoleLabel(role: string): string {
    const m: Record<string, string> = {
      ADMIN: 'Administrateur', ADMINISTRATIF: 'Administratif',
      ENSEIGNANT: 'Enseignant', ETUDIANT: 'Étudiant',
      TUTEUR: 'Tuteur', RESPONSABLE_FORMATION: 'Resp. Formation',
      APPUI_INSERTION: 'Appui Insertion'
    };
    return m[role] || role;
  }

  logout() { this.authService.logout(); }
}
