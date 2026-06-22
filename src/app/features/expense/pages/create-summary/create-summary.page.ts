import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ExpenseStepperComponent } from '../../../../shared/components/expense-stepper/expense-stepper.component';
import { ExpenseReceiptPreviewComponent } from '../../../../shared/components/expense-receipt-preview/expense-receipt-preview.component';
import { ExpenseService, ExpenseDraft } from '../../../../core/services/expense.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-summary',
  templateUrl: './create-summary.page.html',
  styleUrls: ['./create-summary.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TranslatePipe, ExpenseStepperComponent, ExpenseReceiptPreviewComponent, CurrencyPipe, PageHeaderComponent]
})
export class CreateSummaryPage implements OnInit {
  draft: ExpenseDraft | null = null;

  constructor(
    private router: Router,
    public expenseService: ExpenseService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.draft = this.expenseService.draftRequest;
  }

  getCategoryName(cat?: string): string {
    if (!cat) return '';
    const mapping: { [key: string]: string } = {
      travel: 'Perjalanan & Transportasi',
      meals: 'Makanan & Hiburan',
      office: 'Peralatan Kantor',
      hotel: 'Akomodasi / Hotel',
      other: 'Lainnya'
    };
    return mapping[cat] || cat;
  }

  goBack() {
    this.router.navigate(['/expense/create/step-3']);
  }

  async submit() {
    if (!this.draft) return;

    const loading = await this.loadingController.create({
      message: 'Mengirimkan klaim...',
      spinner: 'crescent'
    });
    await loading.present();

    const payload = {
      category: this.draft.category,
      merchant: this.draft.merchant,
      expense_date: this.formatDateToYMD(this.draft.expense_date),
      amount: this.draft.amount,
      notes: this.draft.notes,
      receipt: this.draft.receipt,
      receipt_name: this.draft.receipt_name
    };

    this.expenseService.submitRequest(payload).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.router.navigate(['/expense/create/success'], {
          queryParams: {
            id: res.expense.id,
            amount: res.expense.amount
          }
        });
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Failed to submit expense claim', err);

        let errorMessage = 'Terjadi kesalahan saat mengirim klaim penggantian Anda.';
        if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.error?.errors) {
          const errors = Object.values(err.error.errors) as any[];
          errorMessage = errors.reduce((acc, val) => acc.concat(val), []).join('\n');
        }

        const alert = await this.alertController.create({
          header: 'Pengajuan Gagal',
          message: errorMessage,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  formatDateToYMD(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return this.formatYMD(new Date());
      }
      return this.formatYMD(d);
    } catch (e) {
      return this.formatYMD(new Date());
    }
  }

  formatYMD(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
