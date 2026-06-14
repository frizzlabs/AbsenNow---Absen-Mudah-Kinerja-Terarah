import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PayslipFilterSheetComponent } from '../../components/filter-sheet/filter-sheet.component';

@Component({
  selector: 'app-payslip-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PayslipFilterSheetComponent]
})
export class HomePage {
  constructor(private router: Router, private modalCtrl: ModalController) {}

  goBack() {
    this.router.navigate(['/home']);
  }

  async openFilter() {
    const modal = await this.modalCtrl.create({
      component: PayslipFilterSheetComponent,
      breakpoints: [0, 0.6],
      initialBreakpoint: 0.6,
      cssClass: 'bottom-sheet-modal'
    });
    await modal.present();
  }

  goToDetail() {
    this.router.navigate(['/payslip/detail']);
  }
}
