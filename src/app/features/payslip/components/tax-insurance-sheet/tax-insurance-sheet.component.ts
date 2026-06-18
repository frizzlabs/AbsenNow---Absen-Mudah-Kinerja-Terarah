import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { PayslipItem, PayslipService } from '../../../../core/services/payslip.service';

@Component({
  selector: 'app-payslip-tax-insurance-sheet',
  templateUrl: './tax-insurance-sheet.component.html',
  styleUrls: ['./tax-insurance-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipTaxInsuranceSheetComponent {
  @Input() title = 'Pajak & Asuransi';
  @Input() totalLabel = 'Total Pajak & Asuransi';
  @Input() items: PayslipItem[] = [];
  @Input() total = 0;
  @Input() isDeduction = true;

  constructor(private modalCtrl: ModalController) {}

  fmt(v: number | string): string {
    return PayslipService.formatIDR(v);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
