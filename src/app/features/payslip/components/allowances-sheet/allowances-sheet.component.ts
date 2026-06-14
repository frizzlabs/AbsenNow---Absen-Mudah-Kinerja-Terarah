import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-payslip-allowances-sheet',
  templateUrl: './allowances-sheet.component.html',
  styleUrls: ['./allowances-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipAllowancesSheetComponent {
  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
