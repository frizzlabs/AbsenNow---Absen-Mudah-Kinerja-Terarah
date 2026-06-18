import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CameraFrameComponent } from '../../../shared/components/camera-frame/camera-frame.component';
import { RouterModule, Router } from '@angular/router';
import { AttendanceStateService } from '../../../core/services/attendance-state.service';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-face-validation',
  templateUrl: './face-validation.page.html',
  styleUrls: ['./face-validation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, CameraFrameComponent]
})
export class FaceValidationPage implements OnInit {
  @ViewChild(CameraFrameComponent) cameraFrame!: CameraFrameComponent;

  isSuccess: boolean = false;
  isProcessing = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private attendanceStateService: AttendanceStateService,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
  }

  onFaceDetected(photo: string) {
    if (this.isSuccess || this.isProcessing) return;
    this.submitAttendance(photo);
  }

  async simulateDetection() {
    if (this.isSuccess || this.isProcessing) return;

    if (!this.cameraFrame?.hasCamera) {
      const toast = await this.toastController.create({
        message: 'Kamera tidak tersedia. Tidak dapat melakukan face verification.',
        duration: 2500, position: 'top', color: 'danger'
      });
      await toast.present();
      return;
    }

    const status = this.cameraFrame?.detectionStatus;

    if (status === 'partial') {
      const hint = this.cameraFrame?.statusHint || 'Hadapkan wajah langsung ke depan.';
      const toast = await this.toastController.create({
        message: hint,
        duration: 2500, position: 'top', color: 'warning'
      });
      await toast.present();
      return;
    }

    if (status !== 'ready') {
      const toast = await this.toastController.create({
        message: 'Wajah tidak terdeteksi. Posisikan wajah di dalam lingkaran.',
        duration: 2500, position: 'top', color: 'warning'
      });
      await toast.present();
      return;
    }

    // status === 'ready' → wajah frontal + kedua mata terdeteksi
    const capturedImage = this.cameraFrame.capturePhoto();
    this.submitAttendance(capturedImage);
  }

  private async submitAttendance(image: string | null) {
    this.isProcessing = true;

    const lat = parseFloat(localStorage.getItem('temp_lat') || '-6.200000');
    const lng = parseFloat(localStorage.getItem('temp_lng') || '106.816666');
    const officeId = parseInt(localStorage.getItem('temp_office_id') || '1', 10);
    const isCheckingOut = this.attendanceStateService.state === 'checked_in';

    const request = isCheckingOut 
      ? this.attendanceService.checkOut(lat, lng, image)
      : this.attendanceService.checkIn(lat, lng, officeId, image);

    request.subscribe({
      next: async (res) => {
        this.isSuccess = true;
        this.isProcessing = false;
        
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        localStorage.setItem('success_time', formattedTime);
        localStorage.setItem('success_date', formattedDate);
        
        const officeName = localStorage.getItem('temp_office_name') || 'Headquarters';
        const officeAddress = localStorage.getItem('temp_office_address') || 'Jakarta';
        localStorage.setItem('success_office_name', officeName);
        localStorage.setItem('success_office_address', officeAddress);
        
        const toast = await this.toastController.create({
          message: res.message || 'Verification successful.',
          duration: 1500,
          position: 'top',
          color: 'success'
        });
        await toast.present();

        setTimeout(() => {
          this.router.navigate(['/attendance/success']);
        }, 1000);
      },
      error: async (err) => {
        this.isProcessing = false;
        const errMsg = err.error?.message || 'Verification failed. Please try again.';
        const toast = await this.toastController.create({
          message: errMsg,
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 3000);
      }
    });
  }
}
