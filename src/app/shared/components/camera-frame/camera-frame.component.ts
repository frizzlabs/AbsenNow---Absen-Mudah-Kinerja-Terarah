import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-camera-frame',
  templateUrl: './camera-frame.component.html',
  styleUrls: ['./camera-frame.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CameraFrameComponent {
  @Input() type: 'face' | 'qr' = 'face';
  @Input() active: boolean = false;
  @Input() success: boolean = false;
}
