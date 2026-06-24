import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ExpenseStatCardComponent } from '../../../../shared/components/expense-stat-card/expense-stat-card.component';
import { ExpenseCardComponent } from '../../../../shared/components/expense-card/expense-card.component';
import { ExpenseService } from '../../../../core/services/expense.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, TranslatePipe, ExpenseStatCardComponent, ExpenseCardComponent, PageHeaderComponent, ButtonComponent]
})
export class OverviewPage implements OnInit {
  currentRequests: any[] = [];
  isLoading = true;

  totalAmount = 0;
  pendingAmount = 0;
  approvedAmount = 0;

  constructor(
    private router: Router,
    private expenseService: ExpenseService
  ) { }

  private isFirstLoad = true;

  ngOnInit() {
    this.loadExpenses();
    this.isFirstLoad = false;
  }

  ionViewWillEnter() {
    if (!this.isFirstLoad) {
      this.loadExpenses();
    }
    this.isFirstLoad = false;
  }

  loadExpenses() {
    this.isLoading = true;
    this.expenseService.getRequests().subscribe({
      next: (requests) => {
        this.currentRequests = requests.map(req => {
          return {
            id: req.id,
            title: req.merchant,
            category: this.getCategoryName(req.category),
            date: this.formatDate(req.expense_date),
            amount: parseFloat(req.amount),
            status: this.formatStatus(req.status),
            icon: this.getIconName(req.category),
            iconColor: this.getIconColor(req.category)
          };
        });

        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load expense requests', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    this.pendingAmount = this.currentRequests
      .filter(r => r.status === 'Menunggu')
      .reduce((acc, r) => acc + r.amount, 0);

    this.approvedAmount = this.currentRequests
      .filter(r => r.status === 'Disetujui' || r.status === 'Dibayar')
      .reduce((acc, r) => acc + r.amount, 0);

    this.totalAmount = this.pendingAmount + this.approvedAmount;
  }

  getCategoryName(cat: string): string {
    const mapping: { [key: string]: string } = {
      travel: 'Perjalanan & Transportasi',
      meals: 'Makanan & Hiburan',
      office: 'Peralatan Kantor',
      hotel: 'Akomodasi / Hotel',
      other: 'Lainnya'
    };
    return mapping[cat] || cat;
  }

  getIconName(cat: string): string {
    const mapping: { [key: string]: string } = {
      travel: 'car-outline',
      meals: 'restaurant-outline',
      office: 'business-outline',
      hotel: 'bed-outline',
      other: 'ellipsis-horizontal-outline'
    };
    return mapping[cat] || 'ellipsis-horizontal-outline';
  }

  getIconColor(cat: string): 'primary' | 'warning' | 'danger' | 'success' | 'medium' {
    const mapping: { [key: string]: 'primary' | 'warning' | 'danger' | 'success' | 'medium' } = {
      travel: 'primary',
      meals: 'warning',
      office: 'primary',
      hotel: 'success',
      other: 'medium'
    };
    return mapping[cat] || 'medium';
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  formatStatus(status: string): any {
    if (!status) return 'Menunggu';
    const lower = status.toLowerCase();
    if (lower === 'paid') return 'Dibayar';
    if (lower === 'approved') return 'Disetujui';
    if (lower === 'rejected') return 'Ditolak';
    return 'Menunggu';
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToHistory() {
    this.router.navigate(['/expense/history']);
  }

  goToCreate() {
    this.expenseService.resetDraft();
    this.router.navigate(['/expense/create/step-1']);
  }

  goToDetail(id: number) {
    this.router.navigate(['/expense/detail'], { queryParams: { id } });
  }
}
