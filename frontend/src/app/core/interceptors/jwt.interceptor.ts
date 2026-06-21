import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter le token JWT sur toutes les requêtes sauf /auth/login et /auth/refresh
    const isAuthEndpoint = req.url.includes('/auth/login') ||
                           req.url.includes('/auth/refresh');

    const token = this.authService.getToken();
    if (token && !isAuthEndpoint) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Sur /auth/login → laisser le composant gérer l'erreur lui-même
        // L'intercepteur ne doit PAS afficher de toast ici (double affichage)
        if (isAuthEndpoint) {
          return throwError(() => error);
        }

        // Pour les autres routes : 401 = session expirée → déconnecter
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }

        // Propager l'erreur — c'est ErrorService dans chaque composant qui affiche
        return throwError(() => error);
      })
    );
  }
}
