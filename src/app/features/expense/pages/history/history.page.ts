import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ExpenseCardComponent } from '../../../../shared/components/expense-card/expense-card.component';
import { ExpenseService } from '../../../../core/services/expense.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface ExpenseGroup {
  month: string;
  items: any[];
}

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, TranslatePipe, ExpenseCardComponent, CurrencyPipe, PageHeaderComponent, ButtonComponent]
})
export class HistoryPage implements OnInit {
  groups: ExpenseGroup[] = [];
  isLoading = true;

  pendingTotal = 0;
  approvedTotal = 0;
  rejectedTotal = 0;

  constructor(
    private router: Router,
    private expenseService: ExpenseService
  ) { }

  private isFirstLoad = true;

  ngOnInit() {
    this.loadHistory();
    this.isFirstLoad = false;
  }

  ionViewWillEnter() {
    if (!this.isFirstLoad) {
      this.loadHistory();
    }
    this.isFirstLoad = false;
  }

  loadHistory() {
    this.isLoading = true;
    this.expenseService.getRequests().subscribe({
      next: (requests) => {
        this.groupExpenses(requests);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load expense history', err);
        this.isLoading = false;
      }
    });
  }

  groupExpenses(requests: any[]) {
    const tempGroups: { [key: string]: any[] } = {};
    
    this.pendingTotal = 0;
    this.approvedTotal = 0;
    this.rejectedTotal = 0;

    requests.forEach(req => {
      try {
        const amountNum = parseFloat(req.amount);
        const lowerStatus = req.status.toLowerCase();
        
        if (lowerStatus === 'pending') {
          this.pendingTotal += amountNum;
        } else if (lowerStatus === 'approved' || lowerStatus === 'paid') {
          this.approvedTotal += amountNum;
        } else if (lowerStatus === 'rejected') {
          this.rejectedTotal += amountNum;
        }

        const d = new Date(req.expense_date);
        const monthName = d.toLocaleDateString('id-ID', { month: 'long' }).toUpperCase();
        const year = d.getFullYear();
        const key = `${monthName} ${year}`;

        if (!tempGroups[key]) {
          tempGroups[key] = [];
        }
        
        tempGroups[key].push({
          id: req.id,
          title: req.merchant,
          category: this.getCategoryName(req.category),
          date: this.formatDate(req.expense_date),
          amount: amountNum,
          status: this.formatStatus(req.status),
          icon: this.getIconName(req.category),
          iconColor: this.getIconColor(req.category)
        });
      } catch (e) {
        const key = 'OTHER';
        if (!tempGroups[key]) {
          tempGroups[key] = [];
        }
        tempGroups[key].push(req);
      }
    });

    this.groups = Object.keys(tempGroups).map(key => ({
      month: key,
      items: tempGroups[key]
    }));
  }

  getAmountMain(val: number): number {
    return Math.floor(val);
  }

  getAmountCents(val: number): string {
    const cents = Math.round((val - Math.floor(val)) * 100);
    return '.' + String(cents).padStart(2, '0');
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
    this.router.navigate(['/expense/overview']);
  }

  goToCreate() {
    this.expenseService.resetDraft();
    this.router.navigate(['/expense/create/step-1']);
  }

  goToDetail(id: number) {
    this.router.navigate(['/expense/detail'], { queryParams: { id } });
  }
}
