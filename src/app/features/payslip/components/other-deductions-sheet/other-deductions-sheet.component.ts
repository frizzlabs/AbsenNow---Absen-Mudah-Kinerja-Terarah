import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-payslip-other-deductions-sheet',
  templateUrl: './other-deductions-sheet.component.html',
  styleUrls: ['./other-deductions-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipOtherDeductionsSheetComponent {
  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
