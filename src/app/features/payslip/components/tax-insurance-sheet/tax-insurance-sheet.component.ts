import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-payslip-tax-insurance-sheet',
  templateUrl: './tax-insurance-sheet.component.html',
  styleUrls: ['./tax-insurance-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipTaxInsuranceSheetComponent {
  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
