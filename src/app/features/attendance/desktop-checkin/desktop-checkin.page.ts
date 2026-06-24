import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AttendanceStateService } from '../../../core/services/attendance-state.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-desktop-checkin',
  templateUrl: './desktop-checkin.page.html',
  styleUrls: ['./desktop-checkin.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent],
})
export class DesktopCheckinPage implements OnInit, OnDestroy {
  @ViewChild('videoEl', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  step: 'loading' | 'ready' | 'capturing' | 'submitting' | 'done' | 'error' = 'loading';
  errorMessage = '';

  isCheckingOut = false;
  cameraReady = false;
  private stream: MediaStream | null = null;

  userLat: number | null = null;
  userLng: number | null = null;
  locationStatus: 'pending' | 'ok' | 'error' = 'pending';
  locationLabel = 'Mendeteksi lokasi...';

  office: any = null;
  officeStatus: 'pending' | 'inside' | 'outside' = 'pending';
  distanceMeters = 0;

  capturedImage: string | null = null;
  isSubmitting = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private attendanceService: AttendanceService,
    private attendanceState: AttendanceStateService,
  ) {}

  ngOnInit() {
    this.isCheckingOut = this.attendanceState.state === 'checked_in';
    this.initAll();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async initAll() {
    this.step = 'loading';
    try {
      await Promise.all([this.initGeolocation(), this.loadOffice()]);
      await this.initCamera();
      this.step = 'ready';
    } catch (e: any) {
      this.errorMessage = e.message || 'Gagal inisialisasi';
      this.step = 'error';
    }
  }

  // ── Geolocation ───────────────────────────────────────────────────
  private initGeolocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        this.locationStatus = 'error';
        this.locationLabel = 'Geolocation tidak tersedia di browser ini';
        reject(new Error(this.locationLabel));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.locationStatus = 'ok';
          this.locationLabel = `${this.userLat.toFixed(5)}, ${this.userLng.toFixed(5)}`;
          resolve();
        },
        (err) => {
          this.locationStatus = 'error';
          this.locationLabel = 'Izinkan akses lokasi di browser';
          reject(new Error(this.locationLabel));
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  }

  // ── Office ────────────────────────────────────────────────────────
  private loadOffice(): Promise<void> {
    return new Promise((resolve) => {
      this.attendanceService.getOffices().subscribe({
        next: (offices) => {
          this.office = offices?.[0] || null;
          this.checkRadius();
          resolve();
        },
        error: () => {
          this.office = null;
          resolve();
        },
      });
    });
  }

  private checkRadius() {
    if (!this.office || this.userLat == null || this.userLng == null) {
      this.officeStatus = 'pending';
      return;
    }
    const d = this.haversine(this.userLat, this.userLng, this.office.latitude, this.office.longitude);
    this.distanceMeters = Math.round(d);
    const radius = this.office.radius_meters || 100;
    this.officeStatus = d <= radius ? 'inside' : 'outside';
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ── Camera ────────────────────────────────────────────────────────
  private async initCamera(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setTimeout(() => {
        if (this.videoRef?.nativeElement) {
          this.videoRef.nativeElement.srcObject = this.stream;
          this.cameraReady = true;
        }
      }, 100);
    } catch {
      throw new Error('Izinkan akses kamera di browser');
    }
  }

  private stopCamera() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  // ── Capture ───────────────────────────────────────────────────────
  capture() {
    if (!this.videoRef || !this.canvasRef) return;
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    this.capturedImage = canvas.toDataURL('image/jpeg', 0.8);
    this.step = 'capturing';
  }

  retake() {
    this.capturedImage = null;
    this.step = 'ready';
  }

  // ── Submit ────────────────────────────────────────────────────────
  async submit() {
    if (!this.capturedImage || this.userLat == null || this.userLng == null) return;
    this.isSubmitting = true;
    this.step = 'submitting';

    const request = this.isCheckingOut
      ? this.attendanceService.checkOut(this.userLat, this.userLng, this.capturedImage)
      : this.attendanceService.checkIn(this.userLat, this.userLng, this.office?.id || 1, this.capturedImage);

    request.subscribe({
      next: async (res) => {
        this.isSubmitting = false;
        this.step = 'done';
        this.stopCamera();

        if (this.isCheckingOut) {
          this.attendanceState.performCheckOut();
        } else {
          this.attendanceState.performCheckIn();
        }

        const toast = await this.toastController.create({
          message: res.message || (this.isCheckingOut ? 'Check-out berhasil!' : 'Check-in berhasil!'),
          duration: 2000, position: 'top', color: 'success',
        });
        await toast.present();

        setTimeout(() => this.router.navigate(['/desktop-home']), 2000);
      },
      error: async (err) => {
        this.isSubmitting = false;
        this.step = 'capturing';
        const msg = err.error?.message || 'Gagal submit absensi';
        const toast = await this.toastController.create({
          message: msg, duration: 3000, position: 'top', color: 'danger',
        });
        await toast.present();
      },
    });
  }

  get actionLabel(): string {
    return this.isCheckingOut ? 'Check Out' : 'Check In';
  }
}
