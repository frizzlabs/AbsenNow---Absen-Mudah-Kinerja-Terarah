import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-submit-confirmation-sheet',
  templateUrl: './submit-confirmation-sheet.component.html',
  styleUrls: ['./submit-confirmation-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SubmitConfirmationSheetComponent {
  constructor(private modalCtrl: ModalController) {}

  submit() {
    this.modalCtrl.dismiss({ submitted: true });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
