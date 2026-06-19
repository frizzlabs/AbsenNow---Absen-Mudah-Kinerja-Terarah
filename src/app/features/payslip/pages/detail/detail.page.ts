import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

import { PayslipBasicSalarySheetComponent } from '../../components/basic-salary-sheet/basic-salary-sheet.component';
import { PayslipAllowancesSheetComponent } from '../../components/allowances-sheet/allowances-sheet.component';
import { PayslipTaxInsuranceSheetComponent } from '../../components/tax-insurance-sheet/tax-insurance-sheet.component';
import { PayslipOtherDeductionsSheetComponent } from '../../components/other-deductions-sheet/other-deductions-sheet.component';
import { PayslipService, PayslipSection } from '../../../../core/services/payslip.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-payslip-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PayslipBasicSalarySheetComponent, PayslipAllowancesSheetComponent, PayslipTaxInsuranceSheetComponent, PayslipOtherDeductionsSheetComponent, PageHeaderComponent]
})
export class DetailPage implements OnInit {
  payslip: any = null;
  sections: PayslipSection[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private payslipService: PayslipService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.payslipService.getPayslip(id).subscribe({
        next: (res) => {
          this.payslip = res.payslip;
          this.sections = res.sections;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false)
      });
    } else {
      this.isLoading = false;
    }
  }

  fmt(v: number | string): string {
    return PayslipService.formatIDR(v);
  }

  section(key: string): PayslipSection | undefined {
    return this.sections.find(s => s.section === key);
  }

  sectionTotal(key: string): number {
    return this.section(key)?.total || 0;
  }

  get bankInfo(): string {
    if (!this.payslip?.bank_name) return '';
    const acc = this.payslip.bank_account_masked || '';
    const date = this.payslip.paid_date
      ? new Date(this.payslip.paid_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    return `Gaji Anda telah ditransfer ke rekening ${this.payslip.bank_name} ${acc} pada ${date}.`;
  }

  goBack() {
    this.router.navigate(['/payslip']);
  }

  private async openSection(component: any, key: string, title: string, totalLabel: string, isDeduction: boolean, breakpoint: number) {
    const sec = this.section(key);
    const modal = await this.modalCtrl.create({
      component,
      breakpoints: [0, breakpoint],
      initialBreakpoint: breakpoint,
      cssClass: 'bottom-sheet-modal',
      componentProps: {
        title,
        totalLabel,
        items: sec?.items || [],
        total: sec?.total || 0,
        isDeduction
      }
    });
    await modal.present();
  }

  openBasicSalary() {
    this.openSection(PayslipBasicSalarySheetComponent, 'gaji_pokok', 'Gaji Pokok', 'Total Gaji Pokok', false, 0.65);
  }

  openAllowances() {
    this.openSection(PayslipAllowancesSheetComponent, 'tunjangan', 'Tunjangan', 'Total Tunjangan', false, 0.55);
  }

  openTaxInsurance() {
    this.openSection(PayslipTaxInsuranceSheetComponent, 'pajak_asuransi', 'Pajak & Asuransi', 'Total Pajak & Asuransi', true, 0.55);
  }

  openOtherDeductions() {
    this.openSection(PayslipOtherDeductionsSheetComponent, 'potongan_lain', 'Potongan Lainnya', 'Total Potongan', true, 0.65);
  }
}
