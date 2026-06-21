import { Routes } from '@angular/router';
export const FORMATEURS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./formateurs.component').then(m => m.FormateursComponent) }
];
