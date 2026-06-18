import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DinasLuarDraft {
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  radius: number;
  startDatetime: string;
  endDatetime: string;
  workDetails: string;
}

@Injectable({ providedIn: 'root' })
export class DinasLuarService {
  private apiUrl = environment.apiUrl;
  draft: DinasLuarDraft = this.emptyDraft();
  selectedDinas: any = null;
  absenResult: any = null;
  currentDetail: any = null;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('auth_token')}` });
  }

  emptyDraft(): DinasLuarDraft {
    return { locationName: '', latitude: null, longitude: null, radius: 500, startDatetime: '', endDatetime: '', workDetails: '' };
  }

  resetDraft() { this.draft = this.emptyDraft(); }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dinas-luar`, { headers: this.headers() });
  }

  submit(draft: DinasLuarDraft): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dinas-luar`, {
      location_name:  draft.locationName,
      latitude:       draft.latitude,
      longitude:      draft.longitude,
      radius:         draft.radius,
      start_datetime: draft.startDatetime,
      end_datetime:   draft.endDatetime,
      work_details:   draft.workDetails,
    }, { headers: this.headers() });
  }

  getApprovedActive(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dinas-luar/approved-active`, { headers: this.headers() });
  }

  absen(id: number, lat: number, lng: number, report: string, evidence: File | null): Observable<any> {
    const form = new FormData();
    form.append('latitude', lat.toString());
    form.append('longitude', lng.toString());
    form.append('work_report', report);
    if (evidence) form.append('evidence', evidence);
    return this.http.post<any>(`${this.apiUrl}/dinas-luar/${id}/absen`, form, {
      headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('auth_token')}` }),
    });
  }

  getAbsenRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dinas-luar/absen-records`, { headers: this.headers() });
  }

  getPendingReview(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dinas-luar/pending-review`, { headers: this.headers() });
  }

  getMyReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dinas-luar/my-reviews`, { headers: this.headers() });
  }

  review(id: number, status: 'approved' | 'rejected', note: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/dinas-luar/${id}/review`, { status, review_note: note }, { headers: this.headers() });
  }

  statusLabel(s: string): string {
    return ({ pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' } as any)[s] ?? s;
  }
  statusColor(s: string): string {
    return ({ pending: 'warning', approved: 'success', rejected: 'danger' } as any)[s] ?? 'medium';
  }
  formatDt(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
