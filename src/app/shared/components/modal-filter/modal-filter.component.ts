import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal-filter',
  templateUrl: './modal-filter.component.html',
  styleUrls: ['./modal-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ButtonComponent]
})
export class ModalFilterComponent {

  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
