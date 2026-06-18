import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { SubmitConfirmationSheetComponent } from '../../components/submit-confirmation-sheet/submit-confirmation-sheet.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-timesheet-weekly',
  templateUrl: './weekly.page.html',
  styleUrls: ['./weekly.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent, PageHeaderComponent]
})
export class WeeklyPage {
  constructor(private router: Router, private modalCtrl: ModalController) {}

  goMonthly() {
    this.router.navigate(['/timesheet/monthly']);
  }

  async submitTimesheet() {
    const modal = await this.modalCtrl.create({
      component: SubmitConfirmationSheetComponent,
      breakpoints: [0, 0.75],
      initialBreakpoint: 0.75,
      cssClass: 'bottom-sheet-modal'
    });
    
    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data && data.submitted) {
      this.router.navigate(['/timesheet/success']);
    }
  }
}
