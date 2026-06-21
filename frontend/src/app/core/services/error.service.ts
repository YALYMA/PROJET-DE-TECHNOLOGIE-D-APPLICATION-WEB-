import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ErrorService {

  constructor(private notif: NotificationService) {}

  /**
   * Affiche un message d'erreur adapté selon le code HTTP.
   * @param error  L'erreur HTTP reçue
   * @param context 'login' pour adapter le message du 401 sur la page de connexion
   */
  handle(error: HttpErrorResponse, context?: string): void {
    const serverMessage = error.error?.message || error.error?.error || null;

    switch (error.status) {
      case 0:
        this.notif.error('Impossible de joindre le serveur. Vérifiez que le backend est démarré.');
        break;

      case 400:
        this.notif.error(serverMessage || 'Données invalides. Vérifiez le formulaire.');
        break;

      case 401:
        // Sur la page de login : c'est un mauvais mot de passe, pas une session expirée
        if (context === 'login') {
          this.notif.error(serverMessage || 'Email ou mot de passe incorrect.');
        } else {
          this.notif.error('Session expirée. Veuillez vous reconnecter.');
        }
        break;

      case 403:
        this.notif.error('Accès refusé. Vous n\'avez pas les droits nécessaires.');
        break;

      case 404:
        this.notif.error(serverMessage || 'Ressource introuvable.');
        break;

      case 409:
        this.notif.error(serverMessage || 'Conflit : cet élément existe déjà.');
        break;

      default:
        if (error.status >= 500) {
          this.notif.error(`Erreur serveur (${error.status}). Contactez l'administrateur.`);
        } else {
          this.notif.error(serverMessage || 'Une erreur inattendue est survenue.');
        }
    }
  }
}
