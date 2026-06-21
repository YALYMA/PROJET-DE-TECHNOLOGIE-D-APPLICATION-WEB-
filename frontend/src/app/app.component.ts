import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatProgressBarModule, MatSnackBarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isLoaded = false;
  loadProgress = 0;
  toasts: any[] = [];

  constructor(private notifService: NotificationService) {}

  ngOnInit() {
    const interval = setInterval(() => {
      this.loadProgress += 20;
      if (this.loadProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => this.isLoaded = true, 300);
      }
    }, 200);
    this.notifService.toasts$.subscribe(toasts => this.toasts = toasts);
  }

  removeToast(toast: any) { this.notifService.remove(toast); }
}
