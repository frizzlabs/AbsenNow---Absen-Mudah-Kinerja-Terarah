import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CameraFrameComponent } from '../../../shared/components/camera-frame/camera-frame.component';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-face-validation',
  templateUrl: './face-validation.page.html',
  styleUrls: ['./face-validation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, CameraFrameComponent]
})
export class FaceValidationPage implements OnInit {
  isSuccess: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  simulateDetection() {
    if (this.isSuccess) return;
    this.isSuccess = true;
    
    setTimeout(() => {
      this.router.navigate(['/attendance/success']);
    }, 1000);
  }
}
