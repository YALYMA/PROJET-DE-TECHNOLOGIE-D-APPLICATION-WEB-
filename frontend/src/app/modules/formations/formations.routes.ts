import { Routes } from '@angular/router';
export const FORMATIONS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./formations.component').then(m => m.FormationsComponent) }
];
