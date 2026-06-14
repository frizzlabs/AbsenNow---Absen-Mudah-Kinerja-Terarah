import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PayslipBasicSalarySheetComponent } from '../../components/basic-salary-sheet/basic-salary-sheet.component';
import { PayslipAllowancesSheetComponent } from '../../components/allowances-sheet/allowances-sheet.component';
import { PayslipTaxInsuranceSheetComponent } from '../../components/tax-insurance-sheet/tax-insurance-sheet.component';
import { PayslipOtherDeductionsSheetComponent } from '../../components/other-deductions-sheet/other-deductions-sheet.component';

@Component({
  selector: 'app-payslip-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PayslipBasicSalarySheetComponent, PayslipAllowancesSheetComponent, PayslipTaxInsuranceSheetComponent, PayslipOtherDeductionsSheetComponent]
})
export class DetailPage {
  constructor(private router: Router, private modalCtrl: ModalController) {}

  goBack() {
    this.router.navigate(['/payslip']);
  }

  nextMonth() {
    // Navigate next month
  }

  prevMonth() {
    // Navigate prev month
  }

  async openBasicSalary() {
    const modal = await this.modalCtrl.create({
      component: PayslipBasicSalarySheetComponent,
      breakpoints: [0, 0.65],
      initialBreakpoint: 0.65,
      cssClass: 'bottom-sheet-modal'
    });
    await modal.present();
  }

  async openAllowances() {
    const modal = await this.modalCtrl.create({
      component: PayslipAllowancesSheetComponent,
      breakpoints: [0, 0.55],
      initialBreakpoint: 0.55,
      cssClass: 'bottom-sheet-modal'
    });
    await modal.present();
  }

  async openTaxInsurance() {
    const modal = await this.modalCtrl.create({
      component: PayslipTaxInsuranceSheetComponent,
      breakpoints: [0, 0.55],
      initialBreakpoint: 0.55,
      cssClass: 'bottom-sheet-modal'
    });
    await modal.present();
  }

  async openOtherDeductions() {
    const modal = await this.modalCtrl.create({
      component: PayslipOtherDeductionsSheetComponent,
      breakpoints: [0, 0.65],
      initialBreakpoint: 0.65,
      cssClass: 'bottom-sheet-modal'
    });
    await modal.present();
  }
}
