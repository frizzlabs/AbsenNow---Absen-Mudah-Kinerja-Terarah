import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ExpenseDraft {
  category: string;
  receipt: string | null;
  receipt_name: string | null;
  receipt_size: string | null;
  receipt_type: string | null;
  merchant: string;
  expense_date: string;
  amount: number | null;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = environment.apiUrl;

  // Wizard Draft State
  draftRequest: ExpenseDraft = {
    category: 'meals',
    receipt: null,
    receipt_name: null,
    receipt_size: null,
    receipt_type: null,
    merchant: '',
    expense_date: '',
    amount: null,
    notes: ''
  };

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/expense/requests`, {
      headers: this.getHeaders()
    });
  }

  getRequestDetail(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/expense/requests/${id}`, {
      headers: this.getHeaders()
    });
  }

  submitRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/expense/request`, data, {
      headers: this.getHeaders()
    });
  }

  resetDraft() {
    this.draftRequest = {
      category: 'meals',
      receipt: null,
      receipt_name: null,
      receipt_size: null,
      receipt_type: null,
      merchant: '',
      expense_date: '',
      amount: null,
      notes: ''
    };
  }
}
