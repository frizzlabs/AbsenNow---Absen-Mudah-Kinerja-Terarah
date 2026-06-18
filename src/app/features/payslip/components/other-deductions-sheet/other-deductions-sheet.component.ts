import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { PayslipItem, PayslipService } from '../../../../core/services/payslip.service';

@Component({
  selector: 'app-payslip-other-deductions-sheet',
  templateUrl: './other-deductions-sheet.component.html',
  styleUrls: ['./other-deductions-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipOtherDeductionsSheetComponent {
  @Input() title = 'Potongan Lainnya';
  @Input() totalLabel = 'Total Potongan';
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
