import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Public
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Tous les utilisateurs connectés
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'communication',
    loadChildren: () => import('./modules/communication/communication.routes').then(m => m.COMMUNICATION_ROUTES),
    canActivate: [AuthGuard]
  },

  // Admin, Administratif, Enseignant, Tuteur, Responsable Formation
  {
    path: 'students',
    loadChildren: () => import('./modules/students/students.routes').then(m => m.STUDENTS_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ADMINISTRATIF', 'ENSEIGNANT', 'TUTEUR', 'RESPONSABLE_FORMATION'] }
  },

  // Admin, Administratif, Enseignant, Responsable Formation
  {
    path: 'formations',
    loadChildren: () => import('./modules/formations/formations.routes').then(m => m.FORMATIONS_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ADMINISTRATIF', 'ENSEIGNANT', 'RESPONSABLE_FORMATION'] }
  },

  // Admin, Administratif, Responsable Formation uniquement
  {
    path: 'formateurs',
    loadChildren: () => import('./modules/formateurs/formateurs.routes').then(m => m.FORMATEURS_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ADMINISTRATIF', 'RESPONSABLE_FORMATION'] }
  },

  // Admin, Administratif, Appui Insertion, Étudiant
  {
    path: 'insertion',
    loadChildren: () => import('./modules/insertion/insertion.routes').then(m => m.INSERTION_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ADMINISTRATIF', 'APPUI_INSERTION', 'ETUDIANT'] }
  },

  // Admin et Administratif uniquement
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'ADMINISTRATIF'] }
  },

  { path: '**', redirectTo: '/auth/login' }
];
