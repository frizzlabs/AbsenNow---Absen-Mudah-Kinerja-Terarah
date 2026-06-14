import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-submit-timesheet-modal',
  templateUrl: './submit-timesheet-modal.component.html',
  styleUrls: ['./submit-timesheet-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class SubmitTimesheetModalComponent {
  isConfirmed = false;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  submit() {
    if (this.isConfirmed) {
      this.modalCtrl.dismiss({ submitted: true });
    }
  }
}
