import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PermissionAction {
  id: number;
  name: string;
  action: string;
  action_label: string;
}
export interface PermissionModule {
  module: string;
  label: string;
  permissions: PermissionAction[];
}
export interface RoleDetail {
  role: { id: number; name: string; label: string; description: string; is_system: boolean };
  assigned: number[];
  modules: PermissionModule[];
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = environment.apiUrl;

  // cache permission user yang login
  private myPermissions: string[] = [];
  private myRole: any = null;
  private loaded = false;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ---- Admin: Roles ----
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`, { headers: this.getHeaders() });
  }
  getRole(id: number | string): Observable<RoleDetail> {
    return this.http.get<RoleDetail>(`${this.apiUrl}/roles/${id}`, { headers: this.getHeaders() });
  }
  updateRolePermissions(id: number | string, permissionIds: number[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/roles/${id}/permissions`, { permission_ids: permissionIds }, { headers: this.getHeaders() });
  }

  // ---- Admin: Users ----
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`, { headers: this.getHeaders() });
  }
  updateUserRole(id: number | string, roleId: number, position?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/users/${id}/role`, { role_id: roleId, position: position ?? null }, { headers: this.getHeaders() });
  }

  // ---- Current user permissions (gating UI) ----
  loadMyPermissions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me/permissions`, { headers: this.getHeaders() }).pipe(
      tap(res => {
        this.myPermissions = res?.permissions || [];
        this.myRole = res?.role || null;
        this.loaded = true;
        localStorage.setItem('my_permissions', JSON.stringify(this.myPermissions));
        localStorage.setItem('my_role', JSON.stringify(this.myRole));
      })
    );
  }

  clearCache() {
    this.myPermissions = [];
    this.myRole = null;
    this.loaded = false;
    localStorage.removeItem('my_permissions');
    localStorage.removeItem('my_role');
  }

  private ensureCache() {
    if (!this.loaded) {
      try {
        this.myPermissions = JSON.parse(localStorage.getItem('my_permissions') || '[]');
        this.myRole = JSON.parse(localStorage.getItem('my_role') || 'null');
      } catch (e) { /* ignore */ }
    }
  }

  can(permission: string): boolean {
    this.ensureCache();
    if (this.myRole?.name === 'superadmin') return true;
    return this.myPermissions.includes(permission);
  }

  get role(): any {
    this.ensureCache();
    return this.myRole;
  }
}
