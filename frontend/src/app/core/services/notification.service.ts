import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  show(message: string, type: Toast['type'] = 'info', duration = 4000): void {
    const toast: Toast = {
      id: Date.now().toString(),
      type,
      message,
      icon: this.icons[type]
    };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);
    setTimeout(() => this.remove(toast), duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  info(message: string) { this.show(message, 'info'); }
  warning(message: string) { this.show(message, 'warning'); }

  remove(toast: Toast): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(t => t.id !== toast.id));
  }
}
