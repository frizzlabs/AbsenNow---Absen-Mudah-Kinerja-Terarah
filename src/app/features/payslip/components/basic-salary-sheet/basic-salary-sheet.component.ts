import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { PayslipItem, PayslipService } from '../../../../core/services/payslip.service';

@Component({
  selector: 'app-payslip-basic-salary-sheet',
  templateUrl: './basic-salary-sheet.component.html',
  styleUrls: ['./basic-salary-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipBasicSalarySheetComponent {
  @Input() title = 'Gaji Pokok';
  @Input() totalLabel = 'Total Gaji Pokok';
  @Input() items: PayslipItem[] = [];
  @Input() total = 0;
  @Input() isDeduction = false;

  constructor(private modalCtrl: ModalController) {}

  fmt(v: number | string): string {
    return PayslipService.formatIDR(v);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
