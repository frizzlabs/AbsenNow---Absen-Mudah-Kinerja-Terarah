import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CorrectionDraft {
  date: string;           // YYYY-MM-DD
  correctionType: string; // forgot_checkin, forgot_checkout, gps_error, app_error, dinas_luar, other
  proposedCheckin: string;
  proposedCheckout: string;
  justification: string;
  evidenceFile: File | null;
  evidencePreview: string | null;
}

export const CORRECTION_TYPES = [
  { value: 'forgot_checkin',  label: 'Lupa Absen Datang',  icon: 'log-in-outline' },
  { value: 'forgot_checkout', label: 'Lupa Absen Pulang',  icon: 'log-out-outline' },
  { value: 'gps_error',       label: 'GPS Error',           icon: 'location-outline' },
  { value: 'app_error',       label: 'Aplikasi Error',      icon: 'phone-portrait-outline' },
  { value: 'dinas_luar',      label: 'Dinas Luar',          icon: 'briefcase-outline' },
  { value: 'other',           label: 'Lainnya',             icon: 'ellipsis-horizontal-outline' },
];

@Injectable({ providedIn: 'root' })
export class CorrectionService {
  private apiUrl = environment.apiUrl;

  draft: CorrectionDraft = this.emptyDraft();
  lastSubmitted: any = null;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  emptyDraft(): CorrectionDraft {
    return {
      date: new Date().toISOString().slice(0, 10),
      correctionType: 'forgot_checkin',
      proposedCheckin: '',
      proposedCheckout: '',
      justification: '',
      evidenceFile: null,
      evidencePreview: null,
    };
  }

  resetDraft() { this.draft = this.emptyDraft(); }

  // Pegawai — paginated list, optional status filter ('' = semua)
  getCorrections(page = 1, status = '', perPage = 15): Observable<any> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (status) params.set('status', status);
    return this.http.get<any>(`${this.apiUrl}/attendance/corrections?${params.toString()}`, { headers: this.headers() });
  }

  getCorrection(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/attendance/corrections/${id}`, { headers: this.headers() });
  }

  submitCorrection(draft: CorrectionDraft): Observable<any> {
    const form = new FormData();
    form.append('correction_date', draft.date);
    form.append('correction_type', draft.correctionType);
    if (draft.proposedCheckin)  form.append('proposed_checkin', draft.proposedCheckin);
    if (draft.proposedCheckout) form.append('proposed_checkout', draft.proposedCheckout);
    form.append('justification', draft.justification);
    if (draft.evidenceFile) form.append('evidence', draft.evidenceFile);

    const token = localStorage.getItem('auth_token');
    return this.http.post<any>(`${this.apiUrl}/attendance/corrections`, form, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }

  // Atasan
  getPendingReview(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/attendance/corrections/pending-review`, { headers: this.headers() });
  }

  getMyReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/attendance/corrections/my-reviews`, { headers: this.headers() });
  }

  reviewCorrection(id: number | string, status: 'approved' | 'rejected', note: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/attendance/corrections/${id}/review`, { status, review_note: note }, { headers: this.headers() });
  }

  // Admin BKPSDM
  getAdminCorrections(statusFilter?: string): Observable<any[]> {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/admin/corrections${params}`, { headers: this.headers() });
  }

  typeLabelOf(type: string): string {
    return CORRECTION_TYPES.find(t => t.value === type)?.label ?? type;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };
    return map[status] ?? status;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = { pending: 'warning', approved: 'success', rejected: 'danger' };
    return map[status] ?? 'medium';
  }
}
