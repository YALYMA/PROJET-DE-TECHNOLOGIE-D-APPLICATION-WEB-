import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  photoUrl?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

const TOKEN_KEY   = 'unchk_token';
const USER_KEY    = 'unchk_user';
const REFRESH_KEY = 'unchk_refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public  currentUser$       = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Restaurer la session depuis localStorage au démarrage
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) this.currentUserSubject.next(JSON.parse(stored));
    } catch {}
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY,   res.token);
          localStorage.setItem(REFRESH_KEY, res.refreshToken ?? '');
          localStorage.setItem(USER_KEY,    JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);

    // Ne rediriger que si on n'est pas déjà sur la page de login
    if (!this.router.url.includes('/auth/login')) {
      this.router.navigate(['/auth/login']);
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getCurrentUserRole(): string {
    return this.currentUserSubject.value?.role || '';
  }
}
