import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PayslipFilterSheetComponent } from '../../components/filter-sheet/filter-sheet.component';
import { PayslipService } from '../../../../core/services/payslip.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-payslip-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PayslipFilterSheetComponent, PageHeaderComponent]
})
export class HomePage {
  payslips: any[] = [];
  isLoading = false;
  filters: { year?: string; status?: string } = {};

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private payslipService: PayslipService
  ) {}

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.payslipService.getPayslips(this.filters).subscribe({
      next: (data) => {
        this.payslips = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Gagal memuat slip gaji', err);
        this.isLoading = false;
      }
    });
  }

  get latest(): any {
    return this.payslips.length ? this.payslips[0] : null;
  }

  get history(): any[] {
    return this.payslips.length > 1 ? this.payslips.slice(1) : [];
  }

  fmt(v: number | string): string {
    return PayslipService.formatIDR(v);
  }

  formatPeriod(p: any): string {
    if (!p) return '';
    try {
      const s = new Date(p.period_start);
      const e = new Date(p.period_end);
      return `${s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } catch (e) {
      return p.period_label;
    }
  }

  formatPaidDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return 'Dibayar ' + new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  statusLabel(status: string): string {
    const map: { [k: string]: string } = {
      dibayar: 'Dibayar',
      menunggu: 'Menunggu',
      diproses: 'Diproses'
    };
    return map[status] || status;
  }

  isBonus(p: any): boolean {
    return p?.type === 'bonus';
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  async openFilter() {
    const modal = await this.modalCtrl.create({
      component: PayslipFilterSheetComponent,
      breakpoints: [0, 0.6],
      initialBreakpoint: 0.6,
      cssClass: 'bottom-sheet-modal'
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      if (data.reset) {
        this.filters = {};
      } else {
        this.filters = { year: data.year, status: data.status };
      }
      this.load();
    }
  }

  goToDetail(id: number) {
    this.router.navigate(['/payslip/detail'], { queryParams: { id } });
  }
}
