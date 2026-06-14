import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CameraFrameComponent } from '../../../shared/components/camera-frame/camera-frame.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-qr-validation',
  templateUrl: './qr-validation.page.html',
  styleUrls: ['./qr-validation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, CameraFrameComponent]
})
export class QrValidationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
