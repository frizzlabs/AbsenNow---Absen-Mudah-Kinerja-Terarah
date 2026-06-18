import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-submit-confirmation-sheet',
  templateUrl: './submit-confirmation-sheet.component.html',
  styleUrls: ['./submit-confirmation-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class SubmitConfirmationSheetComponent {
  @Input() totalLabel = '';
  @Input() rangeLabel = '';
  @Input() activitiesCount = 0;

  isConfirmed = false;

  constructor(private modalCtrl: ModalController) {}

  submit() {
    if (!this.isConfirmed) return;
    this.modalCtrl.dismiss({ submitted: true });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
