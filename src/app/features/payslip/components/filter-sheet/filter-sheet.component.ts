import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-payslip-filter-sheet',
  templateUrl: './filter-sheet.component.html',
  styleUrls: ['./filter-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipFilterSheetComponent {
  selectedYear = '2026';
  selectedMonth = 'Semua';
  selectedStatus = 'dibayar';

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  setYear(year: string) {
    this.selectedYear = year;
  }

  setStatus(status: string) {
    this.selectedStatus = status;
  }

  reset() {
    this.modalCtrl.dismiss({ reset: true });
  }

  apply() {
    this.modalCtrl.dismiss({
      year: this.selectedYear,
      status: this.selectedStatus
    });
  }
}
