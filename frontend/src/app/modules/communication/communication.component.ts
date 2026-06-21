import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatListModule, MatDividerModule, MatProgressSpinnerModule,
    MatTabsModule, MatBadgeModule, MatChipsModule, MatCheckboxModule
  ],
  templateUrl: './communication.component.html',
  styleUrl:    './communication.component.scss'
})
export class CommunicationComponent implements OnInit {
  loading = false;
  showForm = false;
  editMode = false;
  saving = false;
  activeTab = 0;
  comptes: any[] = [];
  form!: FormGroup;

  typeFilters = ['TOUS', 'REUNION', 'CIRCULAIRE', 'SEMINAIRE', 'CONSEIL', 'WEBINAIRE'];

  constructor(
    private router: Router,
    private http: HttpClient,
    private notif: NotificationService,
    private errorService: ErrorService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      titre:     ['', Validators.required],
      type:      ['REUNION'],
      date:      [new Date().toISOString().split('T')[0]],
      contenu:   [''],
      roleCible: ['ALL'],
      publie:    [false]
    });
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/communication`).subscribe({
      next: r  => { this.comptes = r.data || r; this.loading = false; },
      error: (err: HttpErrorResponse) => { this.loading = false; this.errorService.handle(err); }
    });
  }

  get filtered() {
    const tab = this.typeFilters[this.activeTab];
    return tab === 'TOUS' ? this.comptes : this.comptes.filter(c => c.type === tab);
  }

  countOf(type: string) {
    return type === 'TOUS' ? this.comptes.length : this.comptes.filter(c => c.type === type).length;
  }

  typeIcon(type: string) {
    return { REUNION: 'groups', CIRCULAIRE: 'article', SEMINAIRE: 'event', CONSEIL: 'account_balance', WEBINAIRE: 'video_call' }[type] || 'description';
  }

  openForm(cr?: any) {
    this.editMode = !!cr;
    this.showForm = true;
    if (cr) this.form.patchValue(cr);
    else this.form.reset({ type: 'REUNION', date: new Date().toISOString().split('T')[0], roleCible: 'ALL', publie: false });
  }

  closeForm() { this.showForm = false; }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    const req = this.editMode
      ? this.http.put(`${environment.apiUrl}/communication/${v.id}`, v)
      : this.http.post(`${environment.apiUrl}/communication`, v);
    req.subscribe({
      next: () => { this.notif.success('Enregistré ✓'); this.closeForm(); this.loadData(); this.saving = false; },
      error: (err: HttpErrorResponse) => { this.errorService.handle(err); this.saving = false; }
    });
  }

  delete(id: number) {
    if (!confirm('Supprimer ce document définitivement ?')) return;
    this.http.delete(`${environment.apiUrl}/communication/${id}`).subscribe({
      next: () => { this.notif.success('Document supprimé'); this.loadData(); },
      error: (err: HttpErrorResponse) => this.errorService.handle(err)
    });
  }

  canCreate() { return ['ADMIN', 'ADMINISTRATIF', 'RESPONSABLE_FORMATION'].includes(this.auth.currentUser?.role ?? ''); }
}
