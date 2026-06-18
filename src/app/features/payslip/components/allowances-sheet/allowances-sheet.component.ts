import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { PayslipItem, PayslipService } from '../../../../core/services/payslip.service';

@Component({
  selector: 'app-payslip-allowances-sheet',
  templateUrl: './allowances-sheet.component.html',
  styleUrls: ['./allowances-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipAllowancesSheetComponent {
  @Input() title = 'Tunjangan';
  @Input() totalLabel = 'Total Tunjangan';
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
