import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { DinasLuarService } from '../../../../core/services/dinas-luar.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-absen-form',
  templateUrl: './absen-form.page.html',
  styleUrls: ['./absen-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, ButtonComponent, BottomNavComponent]
})
export class AbsenFormPage implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoElRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasElRef!: ElementRef<HTMLCanvasElement>;

  workReport = '';
  lat: number | null = null;
  lng: number | null = null;
  geofenceStatus: 'idle' | 'getting' | 'valid' | 'invalid' = 'idle';
  isSubmitting = false;

  // Selfie state
  selfieDataUrl: string | null = null;
  isTakingPhoto = false;
  // Web camera state
  cameraActive = false;
  private stream: MediaStream | null = null;

  readonly isNative = Capacitor.isNativePlatform();

  constructor(
    public dinasService: DinasLuarService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    if (!this.dinasService.selectedDinas) {
      this.router.navigate(['/dinas-luar/absen']);
    }
  }

  ngOnDestroy() {
    this.stopWebCamera();
  }

  get dinas() { return this.dinasService.selectedDinas; }
  fmtDt(iso: string) { return this.dinasService.formatDt(iso); }

  // ── Geofence ────────────────────────────────────────────────────
  getLocation() {
    if (!navigator.geolocation) return;
    this.geofenceStatus = 'getting';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.lat = pos.coords.latitude;
        this.lng = pos.coords.longitude;
        const dist = this.haversine(this.lat, this.lng, this.dinas.latitude, this.dinas.longitude);
        this.geofenceStatus = dist <= this.dinas.radius ? 'valid' : 'invalid';
      },
      () => {
        this.geofenceStatus = 'idle';
        this.showToast('Tidak dapat mengambil lokasi GPS.', 'danger');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // ── Camera: native (iOS/Android) ────────────────────────────────
  async takeNativeSelfie() {
    this.isTakingPhoto = true;
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,      // kamera saja, tidak ada galeri
        direction: CameraDirection.Front, // kamera depan
        presentationStyle: 'fullscreen',
        saveToGallery: false,
      });
      this.selfieDataUrl = photo.dataUrl ?? null;
    } catch (err: any) {
      if (err?.message !== 'User cancelled photos app') {
        this.showToast('Tidak dapat membuka kamera. Periksa izin kamera di pengaturan.', 'danger');
      }
    } finally {
      this.isTakingPhoto = false;
    }
  }

  // ── Camera: web (getUserMedia — tidak ada akses galeri) ─────────
  async startWebCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      this.cameraActive = true;
      setTimeout(() => {
        const video = this.videoElRef?.nativeElement;
        if (video) { video.srcObject = this.stream; video.play(); }
      }, 100);
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Aktifkan kamera di pengaturan browser.'
        : 'Kamera tidak tersedia.';
      this.showToast(msg, 'danger');
    }
  }

  captureWebSelfie() {
    const video = this.videoElRef?.nativeElement;
    const canvas = this.canvasElRef?.nativeElement;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.selfieDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    this.cameraActive = false;
    this.stopWebCamera();
  }

  private stopWebCamera() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  // ── Unified entry points ────────────────────────────────────────
  openCamera() {
    if (this.isNative) {
      this.takeNativeSelfie();
    } else {
      this.startWebCamera();
    }
  }

  retakeSelfie() {
    this.selfieDataUrl = null;
    this.openCamera();
  }

  // ── Validation & Submit ─────────────────────────────────────────
  get isValid(): boolean {
    return !!(this.lat && this.lng && this.workReport.length >= 10 && this.selfieDataUrl);
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  async submit() {
    if (!this.isValid || this.isSubmitting) return;
    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({ message: 'Mencatat absen dinas...' });
    await loading.present();

    const selfieFile = this.dataUrlToFile(this.selfieDataUrl!, `selfie_${Date.now()}.jpg`);

    this.dinasService.absen(this.dinas.id, this.lat!, this.lng!, this.workReport, selfieFile).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.dinasService.absenResult = res;
        this.router.navigate(['/dinas-luar/submitted'], { queryParams: { type: 'absen' } });
      },
      error: async (err) => {
        await loading.dismiss();
        this.isSubmitting = false;
        this.showToast(err.error?.message || 'Gagal mencatat absen dinas.', 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 3000, position: 'top', color });
    await t.present();
  }
}
