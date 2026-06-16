import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

declare var tracking: any;

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

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  hasCamera = false;
  private stream: MediaStream | null = null;
  private trackerTask: any = null;

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.type === 'face') {
      this.startCamera();
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          this.stream = stream;
          this.hasCamera = true;
          setTimeout(() => {
            if (this.videoElement && this.videoElement.nativeElement) {
              const video = this.videoElement.nativeElement;
              video.srcObject = stream;

              // Initialize face tracking if tracking.js is available
              try {
                if (typeof tracking !== 'undefined') {
                  const tracker = new tracking.ObjectTracker('face');
                  tracker.setInitialScale(4);
                  tracker.setStepSize(2);
                  tracker.setEdgesDensity(0.1);

                  this.trackerTask = tracking.track(video, tracker);

                  let detectionStreak = 0;
                  const STREAK_REQUIRED = 5;

                  tracker.on('track', (event: any) => {
                    if (this.success) return;

                    if (event.data && event.data.length > 0) {
                      const rect = event.data[0];
                      // Face must occupy a reasonable portion of the canvas to count as front-facing close-up
                      if (rect.width > 60 && rect.height > 60) {
                        detectionStreak++;
                        if (detectionStreak >= STREAK_REQUIRED) {
                          // Stop tracking
                          if (this.trackerTask) {
                            this.trackerTask.stop();
                          }
                          // Capture snapshot and emit event
                          const photo = this.capturePhoto();
                          if (photo) {
                            this.onFaceDetected.emit(photo);
                          }
                        }
                      } else {
                        detectionStreak = 0;
                      }
                    } else {
                      detectionStreak = 0;
                    }
                  });
                }
              } catch (err) {
                console.warn('Face tracker initialization failed:', err);
              }
            }
          }, 150);
        })
        .catch((error) => {
          console.warn('Camera access error, falling back to static mockup:', error);
          this.hasCamera = false;
        });
    } else {
      this.hasCamera = false;
    }
  }

  stopCamera() {
    if (this.trackerTask) {
      try {
        this.trackerTask.stop();
      } catch (e) {}
      this.trackerTask = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  capturePhoto(): string | null {
    if (!this.hasCamera || !this.videoElement || !this.videoElement.nativeElement) {
      return null;
    }
    try {
      const video = this.videoElement.nativeElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (e) {
      console.error('Error capturing video frame:', e);
    }
    return null;
  }
}
