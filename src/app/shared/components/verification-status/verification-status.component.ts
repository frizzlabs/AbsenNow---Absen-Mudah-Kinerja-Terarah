import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-verification-status',
  templateUrl: './verification-status.component.html',
  styleUrls: ['./verification-status.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class VerificationStatusComponent {
  @Input() status: 'confirmed' | 'required' = 'required';
  @Input() title: string = '';
  @Input() description: string = '';
}
