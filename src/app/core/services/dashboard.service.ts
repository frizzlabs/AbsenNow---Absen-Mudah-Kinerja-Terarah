import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecentUpdate {
  type: string;
  icon: string;
  color: string;
  title: string;
  message: string | null;
  time: string | null;
  link: string;
}

export interface InstagramPost {
  id: number;
  type: 'post' | 'reels';
  username: string;
  profile_name: string;
  profile_pic: string;
  thumbnail_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  post_url: string;
  published_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getRecentUpdates(limit: number = 8): Observable<RecentUpdate[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<RecentUpdate[]>(`${this.apiUrl}/dashboard/recent-updates`, {
      headers: this.getHeaders(),
      params
    });
  }

  getNewsFeed(): Observable<InstagramPost[]> {
    return this.http.get<InstagramPost[]>(`${this.apiUrl}/dashboard/news`, {
      headers: this.getHeaders()
    });
  }
}
