import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getStatusToday(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/attendance/today`, {
      headers: this.getHeaders()
    });
  }

  checkIn(latitude: number, longitude: number, officeId: number, image?: string | null): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/attendance/check-in`, {
      latitude,
      longitude,
      office_id: officeId,
      image: image || null
    }, {
      headers: this.getHeaders()
    });
  }

  checkOut(latitude: number, longitude: number, image?: string | null): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/attendance/check-out`, {
      latitude,
      longitude,
      image: image || null
    }, {
      headers: this.getHeaders()
    });
  }

  getOffices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/offices`, {
      headers: this.getHeaders()
    });
  }

  updateOfficeCoordinates(latitude: number, longitude: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/offices/update-coordinates`, {
      latitude,
      longitude
    }, {
      headers: this.getHeaders()
    });
  }

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/attendance/history`, {
      headers: this.getHeaders()
    });
  }
}
