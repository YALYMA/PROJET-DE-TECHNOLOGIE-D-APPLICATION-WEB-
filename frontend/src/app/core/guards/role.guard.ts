import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private notif: NotificationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles: string[] = route.data['roles'] || [];
    const userRole = this.authService.getCurrentUserRole();

    if (requiredRoles.length === 0 || requiredRoles.includes(userRole)) {
      return true;
    }

    // Accès refusé — rediriger vers le dashboard avec un message
    this.notif.error(`Accès refusé. Cette section est réservée aux : ${requiredRoles.join(', ')}.`);
    this.router.navigate(['/dashboard']);
    return false;
  }
}
