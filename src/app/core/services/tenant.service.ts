import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TenantBranding {
  name: string;
  code: string;
  logo_url: string | null;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  private apiUrl = environment.apiUrl;
  branding$ = new BehaviorSubject<TenantBranding | null>(this.cached());

  constructor(private http: HttpClient) {}

  private cached(): TenantBranding | null {
    try {
      return JSON.parse(localStorage.getItem('tenant_branding') || 'null');
    } catch {
      return null;
    }
  }

  /** Resolve the tenant code from query param (dev), subdomain (prod), or cache. */
  resolveCode(): string | null {
    const q = new URLSearchParams(window.location.search).get('tenant');
    if (q) {
      localStorage.setItem('tenant_code', q);
      return q;
    }

    const host = window.location.hostname; // e.g. tangerang.absennow.id
    const parts = host.split('.');
    const skip = ['localhost', 'www', '127', '0'];
    if (parts.length >= 3 && !skip.includes(parts[0])) {
      localStorage.setItem('tenant_code', parts[0]);
      return parts[0];
    }

    return localStorage.getItem('tenant_code');
  }

  /** Fetch + cache branding for the resolved tenant (call at login/app start). */
  load(): void {
    const code = this.resolveCode();
    if (!code) {
      this.branding$.next(null);
      return;
    }
    this.http.get<TenantBranding>(`${this.apiUrl}/tenant/${code}`).subscribe({
      next: (b) => {
        localStorage.setItem('tenant_branding', JSON.stringify(b));
        this.branding$.next(b);
      },
      error: () => {
        this.branding$.next(this.cached());
      },
    });
  }

  current(): TenantBranding | null {
    return this.branding$.value;
  }
}
