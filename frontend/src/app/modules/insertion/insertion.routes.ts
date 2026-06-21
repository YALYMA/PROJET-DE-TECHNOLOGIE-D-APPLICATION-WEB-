import { Routes } from '@angular/router';
export const INSERTION_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./insertion.component').then(m => m.InsertionComponent) }
];
