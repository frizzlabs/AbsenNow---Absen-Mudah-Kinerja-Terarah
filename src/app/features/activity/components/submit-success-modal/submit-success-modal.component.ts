import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-submit-success-modal',
  templateUrl: './submit-success-modal.component.html',
  styleUrls: ['./submit-success-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SubmitSuccessModalComponent {
  constructor(private modalCtrl: ModalController, private router: Router) {}

  backToActivity() {
    this.modalCtrl.dismiss();
  }

  goToApproval() {
    this.modalCtrl.dismiss().then(() => {
      this.router.navigate(['/timesheet/approval-status']);
    });
  }
}
