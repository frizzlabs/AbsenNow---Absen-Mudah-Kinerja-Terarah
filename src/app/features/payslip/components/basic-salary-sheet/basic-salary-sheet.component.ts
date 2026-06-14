import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-payslip-basic-salary-sheet',
  templateUrl: './basic-salary-sheet.component.html',
  styleUrls: ['./basic-salary-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipBasicSalarySheetComponent {
  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
