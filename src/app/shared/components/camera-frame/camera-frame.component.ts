import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

declare var tracking: any;

type DetectionStatus = 'none' | 'partial' | 'ready';

@Component({
  selector: 'app-camera-frame',
  templateUrl: './camera-frame.component.html',
  styleUrls: ['./camera-frame.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CameraFrameComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() type: 'face' | 'qr' = 'face';
  @Input() active: boolean = false;
  @Input() success: boolean = false;

  @Output() onFaceDetected = new EventEmitter<string>();
  @Output() detectionStatusChange = new EventEmitter<DetectionStatus>();

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  hasCamera = false;
  isFaceVisible = false;
  detectionStatus: DetectionStatus = 'none';
  statusHint = 'Posisikan wajah di dalam lingkaran';

  private stream: MediaStream | null = null;
  private trackerTask: any = null;
  private detectionStreak = 0;
  private readonly STREAK_REQUIRED = 5;

  private lastFaces: any[] = [];

  livenessProgress = 0;
  livenessStep: 'none' | 'blink' | 'success' = 'none';
  private livenessInterval: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.type === 'face') {
      this.startCamera();
    }
  }

  ngOnDestroy() {
    this.stopCamera();
    if (this.livenessInterval) {
      clearInterval(this.livenessInterval);
    }
  }

  getStrokeDasharray(): string {
    return '666';
  }

  getStrokeDashoffset(): string {
    const total = 666;
    return (total - (this.livenessProgress / 100) * total).toString();
  }

  private startLivenessCheck() {
    this.livenessStep = 'blink';
    this.livenessProgress = 0;
    this.statusHint = 'Kedipkan mata Anda untuk verifikasi…';
    this.cdr.detectChanges();

    if (this.livenessInterval) {
      clearInterval(this.livenessInterval);
    }

    this.livenessInterval = setInterval(() => {
      if (this.detectionStatus !== 'ready') {
        this.resetLiveness();
        this.cdr.detectChanges();
        return;
      }

      this.livenessProgress += 10;
      this.cdr.detectChanges();

      if (this.livenessProgress >= 100) {
        this.livenessProgress = 100;
        clearInterval(this.livenessInterval);
        this.livenessInterval = null;
        this.livenessStep = 'success';
        this.cdr.detectChanges();

        // Capture photo
        if (this.trackerTask) {
          try { this.trackerTask.stop(); } catch (e) {}
        }
        const photo = this.capturePhoto();
        if (photo) {
          this.onFaceDetected.emit(photo);
        }
      }
    }, 150);
  }

  private resetLiveness() {
    if (this.livenessInterval) {
      clearInterval(this.livenessInterval);
      this.livenessInterval = null;
    }
    this.livenessStep = 'none';
    this.livenessProgress = 0;
    this.detectionStreak = 0;
  }

  startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.hasCamera = false;
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        this.stream = stream;
        this.hasCamera = true;
        setTimeout(() => this.initTrackers(), 200);
      })
      .catch(() => { this.hasCamera = false; });
  }

  private initTrackers() {
    const video = this.videoElement?.nativeElement;
    if (!video) return;
    video.srcObject = this.stream;
    
    video.play().catch(err => {
      console.warn("Video stream autoplay was prevented or failed:", err);
    });

    try {
      if (typeof tracking === 'undefined') return;

      const tracker = new tracking.ObjectTracker('face');
      tracker.setInitialScale(4);
      tracker.setStepSize(2);
      tracker.setEdgesDensity(0.1);

      this.trackerTask = tracking.track(video, tracker);

      tracker.on('track', (event: any) => {
        if (this.success) return;
        this.lastFaces = event.data || [];
        this.evaluate();
      });
    } catch (err) {
      console.warn('Face tracker init failed:', err);
    }
  }

  private evaluate() {
    const faces = this.lastFaces;

    if (faces.length === 0) {
      this.setStatus('none');
      this.statusHint = 'Posisikan wajah di dalam lingkaran';
      this.isFaceVisible = false;
      this.resetLiveness();
      return;
    }

    // Best face = largest detected
    const best = faces.reduce((a: any, b: any) => (a.width > b.width ? a : b));

    // Too small = terlalu jauh / buram
    if (best.width < 60 || best.height < 60) {
      this.setStatus('partial');
      this.statusHint = 'Dekatkan wajah ke kamera';
      this.isFaceVisible = false;
      this.resetLiveness();
      return;
    }

    // Terlalu miring: tracking.js memberi bbox sempit saat wajah miring
    const ratio = best.width / best.height;
    if (ratio < 0.50) {
      this.setStatus('partial');
      this.statusHint = 'Hadapkan wajah langsung ke depan';
      this.isFaceVisible = false;
      this.resetLiveness();
      return;
    }

    // Semua OK → ready
    this.setStatus('ready');
    this.isFaceVisible = true;
    this.detectionStreak++;

    if (this.detectionStreak >= this.STREAK_REQUIRED) {
      if (this.livenessStep === 'none') {
        this.startLivenessCheck();
      }
    } else {
      this.statusHint = 'Tahan beberapa detik…';
    }
  }

  private setStatus(s: DetectionStatus) {
    if (this.detectionStatus !== s) {
      this.detectionStatus = s;
      this.detectionStatusChange.emit(s);
    } else {
      this.detectionStatus = s;
    }
  }

  stopCamera() {
    if (this.trackerTask) {
      try { this.trackerTask.stop(); } catch (e) {}
      this.trackerTask = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  capturePhoto(): string | null {
    if (!this.hasCamera || !this.videoElement?.nativeElement) return null;
    try {
      const video = this.videoElement.nativeElement;
      const canvas = document.createElement('canvas');
      canvas.width  = video.videoWidth  || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (e) {}
    return null;
  }
}
