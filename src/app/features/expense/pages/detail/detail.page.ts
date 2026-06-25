import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ExpenseReceiptPreviewComponent } from '../../../../shared/components/expense-receipt-preview/expense-receipt-preview.component';
import { ExpenseTimelineComponent } from '../../../../shared/components/expense-timeline/expense-timeline.component';
import { TimelineStep } from '../../../../shared/components/expense-timeline/expense-timeline.models';
import { ExpenseService } from '../../../../core/services/expense.service';
import { environment } from '../../../../../environments/environment';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TranslatePipe, ExpenseReceiptPreviewComponent, ExpenseTimelineComponent, CurrencyPipe, PageHeaderComponent, BottomNavComponent]
})
export class DetailPage implements OnInit {
  expense: any = null;
  isLoading = true;
  timelineSteps: TimelineStep[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private expenseService: ExpenseService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadDetail(id);
      } else {
        this.goBack();
      }
    });
  }

  loadDetail(id: number | string) {
    this.isLoading = true;
    this.expenseService.getRequestDetail(id).subscribe({
      next: (data) => {
        this.expense = data;
        this.buildTimeline();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load expense detail', err);
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  buildTimeline() {
    if (!this.expense) return;

    const steps: TimelineStep[] = [];
    const creatorName = this.expense.user ? this.expense.user.name : 'Karyawan';
    const createdAtFormatted = this.formatTime(this.expense.created_at);
    const updatedAtFormatted = this.formatTime(this.expense.updated_at);

    // Step 1: Submitted (always success)
    steps.push({
      title: 'Dikirim',
      subtitle: `Pengajuan dibuat oleh <strong>${creatorName}</strong>`,
      time: createdAtFormatted,
      status: 'success'
    });

    const status = this.expense.status.toLowerCase();

    if (status === 'pending') {
      steps.push({
        title: 'Tinjauan Keuangan',
        subtitle: 'Menunggu tinjauan dari tim Keuangan',
        time: '',
        status: 'warning'
      });
    } else if (status === 'approved' || status === 'paid') {
      steps.push({
        title: 'Tinjauan Keuangan',
        subtitle: 'Disetujui oleh tim Keuangan',
        time: updatedAtFormatted,
        status: 'success'
      });
      if (status === 'paid') {
        steps.push({
          title: 'Diproses',
          subtitle: 'Reimbursement disalurkan ke rekening bank',
          time: updatedAtFormatted,
          status: 'success'
        });
      }
    } else if (status === 'rejected') {
      steps.push({
        title: 'Ditolak',
        subtitle: 'Ditolak oleh tim Keuangan',
        time: updatedAtFormatted,
        status: 'danger'
      });
    }

    this.timelineSteps = steps;
  }

  formatTime(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    try {
      const d = new Date(dateTimeStr);
      return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return dateTimeStr;
    }
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

  getFormattedDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  getReceiptUrl(receiptPath: string | null): string {
    if (!receiptPath) return 'assets/images/receipt-placeholder.jpg';
    if (receiptPath.startsWith('http') || receiptPath.startsWith('data:')) {
      return receiptPath;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${receiptPath}`;
  }

  getFileName(receiptPath: string | null): string {
    if (!receiptPath) return 'Tidak Ada Struk';
    return receiptPath.split('/').pop() || 'receipt.jpg';
  }

  formatStatus(status: string): string {
    if (!status) return 'Menunggu';
    const lower = status.toLowerCase();
    if (lower === 'paid') return 'Dibayar';
    if (lower === 'approved') return 'Disetujui';
    if (lower === 'rejected') return 'Ditolak';
    return 'Menunggu';
  }

  viewReceipt(url: string) {
    if (url && url !== 'assets/images/receipt-placeholder.jpg') {
      window.open(url, '_blank');
    }
  }

  goBack() {
    this.router.navigate(['/expense/history']);
  }

  editExpense() {
    if (this.expense) {
      this.router.navigate(['/expense/revision'], { queryParams: { id: this.expense.id } });
    }
  }
}
