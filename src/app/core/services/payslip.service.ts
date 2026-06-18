import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PayslipItem {
  id: number;
  section: string;
  title: string;
  subtitle: string | null;
  icon: string | null;
  amount: string | number;
  is_deduction: boolean;
}

export interface PayslipSection {
  section: string;
  label: string;
  is_deduction: boolean;
  total: number;
  items: PayslipItem[];
}

export interface PayslipDetail {
  payslip: any;
  sections: PayslipSection[];
}

@Injectable({
  providedIn: 'root'
})
export class PayslipService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /** Filter opsional: year, month (1-12), status (dibayar|menunggu|diproses). */
  getPayslips(filters?: { year?: string | number; month?: string | number; status?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filters?.year) params = params.set('year', filters.year);
    if (filters?.month) params = params.set('month', filters.month);
    if (filters?.status) params = params.set('status', filters.status);
    return this.http.get<any[]>(`${this.apiUrl}/payslips`, {
      headers: this.getHeaders(),
      params
    });
  }

  getPayslip(id: number | string): Observable<PayslipDetail> {
    return this.http.get<PayslipDetail>(`${this.apiUrl}/payslips/${id}`, {
      headers: this.getHeaders()
    });
  }

  /** Format angka ke Rupiah, mis. 11850000 -> "Rp 11.850.000". */
  static formatIDR(amount: number | string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return 'Rp 0';
    return 'Rp ' + Math.round(value).toLocaleString('id-ID');
  }
}
