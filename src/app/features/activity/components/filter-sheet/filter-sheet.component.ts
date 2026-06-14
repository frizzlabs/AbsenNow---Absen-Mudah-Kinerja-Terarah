import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-activity-filter-sheet',
  templateUrl: './filter-sheet.component.html',
  styleUrls: ['./filter-sheet.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class FilterSheetComponent {
  constructor(private modalCtrl: ModalController) {}

  applyFilters() {
    this.modalCtrl.dismiss({ applied: true });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
