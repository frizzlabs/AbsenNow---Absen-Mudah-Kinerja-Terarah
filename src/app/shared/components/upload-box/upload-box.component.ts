import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-upload-box',
  templateUrl: './upload-box.component.html',
  styleUrls: ['./upload-box.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class UploadBoxComponent {
  @Input() status: 'empty' | 'filled' = 'empty';
  @Input() helperText?: string;
  @Input() fileName?: string;
  @Input() fileSize?: string;
}
