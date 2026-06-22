import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { environment } from '../../../../environments/environment';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-attendance-detail-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="modal-handle"></div>

    <div class="modal-header">
      <div class="emp-row">
        <div class="emp-avatar">{{ emp?.name?.charAt(0)?.toUpperCase() }}</div>
        <div class="emp-info">
          <div class="emp-name">{{ emp?.name }}</div>
          <div class="emp-role">{{ emp?.job_title || emp?.department || emp?.role }}</div>
        </div>
        <div class="status-chip" [ngClass]="emp?.status">{{ statusLabel(emp?.status) }}</div>
      </div>
    </div>

    <ion-content class="modal-content">
      <div class="modal-body">

        <div *ngIf="loadingDetail" class="loading-row">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>

        <ng-container *ngIf="!loadingDetail">

          <ng-container *ngIf="detail || emp?.attendance; else noAttendance">

            <div class="section-label">WAKTU ABSENSI</div>

            <div class="time-row">
              <div class="time-col">
                <span class="col-lbl">Absen Masuk</span>
                <span class="col-val check-in">{{ (detail?.check_in || emp?.attendance?.check_in) | slice:0:5 }}</span>
              </div>
              <div class="time-divider"></div>
              <div class="time-col">
                <span class="col-lbl">Absen Keluar</span>
                <span class="col-val check-out">{{ (detail?.check_out || emp?.attendance?.check_out) ? ((detail?.check_out || emp?.attendance?.check_out) | slice:0:5) : '—' }}</span>
              </div>
            </div>

            <ng-container *ngIf="detail?.image_in || detail?.image_out">
              <div class="section-label mt-20">FOTO ABSENSI</div>
              <div class="photos-row">
                <div class="photo-block" *ngIf="detail?.image_in">
                  <span class="photo-lbl">Masuk</span>
                  <img [src]="imgUrl(detail.image_in)" class="face-img" />
                </div>
                <div class="photo-block" *ngIf="detail?.image_out">
                  <span class="photo-lbl">Keluar</span>
                  <img [src]="imgUrl(detail.image_out)" class="face-img" />
                </div>
              </div>
            </ng-container>

            <ng-container *ngIf="detail?.latitude_in">
              <div class="section-label mt-20">LOKASI</div>
              <div class="location-row">
                <ion-icon name="location-outline"></ion-icon>
                <span>{{ detail.latitude_in }}, {{ detail.longitude_in }}</span>
              </div>
            </ng-container>

          </ng-container>

          <ng-template #noAttendance>
            <div class="no-attendance">
              <ion-icon name="calendar-outline"></ion-icon>
              <p>Karyawan ini belum melakukan absensi pada tanggal ini.</p>
            </div>
          </ng-template>

        </ng-container>

      </div>
    </ion-content>

    <div class="modal-footer">
      <ion-button expand="block" fill="outline" shape="round" (click)="close()">Tutup</ion-button>
    </div>
  `,
  styles: [`
    .modal-handle {
      width: 40px; height: 4px; background: #e2e8f0;
      border-radius: 4px; margin: 12px auto 0;
    }
    .modal-header {
      padding: 16px 20px 14px;
      border-bottom: 1px solid #f1f5f9;
    }
    .emp-row { display: flex; align-items: center; gap: 12px; }
    .emp-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: #e0e7ff; color: #4f46e5;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; flex-shrink: 0;
    }
    .emp-info { flex: 1; }
    .emp-name { font-size: 15px; font-weight: 700; color: #1e293b; }
    .emp-role { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .status-chip {
      font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px;
      &.present { background: #ecfdf5; color: #065f46; }
      &.late    { background: #fffbeb; color: #92400e; }
      &.absent  { background: #fef2f2; color: #991b1b; }
    }
    .modal-content { --background: #fff; }
    .modal-body { padding: 20px; }
    .loading-row { display: flex; justify-content: center; padding: 40px 0; }
    .section-label {
      font-size: 11px; font-weight: 700; color: #94a3b8;
      letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 12px;
      &.mt-20 { margin-top: 24px; }
    }
    .time-row { display: flex; align-items: center; gap: 20px; margin-bottom: 4px; }
    .time-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .col-lbl { font-size: 12px; color: #94a3b8; }
    .col-val { font-size: 26px; font-weight: 700;
      &.check-in  { color: #10b981; }
      &.check-out { color: #ef4444; }
    }
    .time-divider { width: 1px; height: 44px; background: #e2e8f0; }
    .photos-row { display: flex; gap: 16px; }
    .photo-block { display: flex; flex-direction: column; gap: 6px; }
    .photo-lbl { font-size: 12px; color: #94a3b8; font-weight: 500; }
    .face-img {
      width: 130px; height: 130px; object-fit: cover;
      border-radius: 14px; border: 2px solid #e2e8f0;
    }
    .location-row {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: #475569;
      ion-icon { font-size: 16px; color: #94a3b8; }
    }
    .no-attendance {
      display: flex; flex-direction: column; align-items: center;
      padding: 40px 0; gap: 12px; text-align: center;
      ion-icon { font-size: 44px; color: #cbd5e1; }
      p { margin: 0; font-size: 14px; color: #94a3b8; }
    }
    .modal-footer { padding: 8px 20px 28px; border-top: 1px solid #f1f5f9; }
  `]
})
export class AttendanceDetailModalComponent implements OnInit {
  @Input() emp: any;

  detail: any = null;
  loadingDetail = false;

  constructor(
    private modalCtrl: ModalController,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    const id = this.emp?.attendance?.id;
    if (id) {
      this.loadingDetail = true;
      this.attendanceService.getAttendanceById(id).subscribe({
        next: (data) => { this.detail = data; this.loadingDetail = false; },
        error: () => { this.loadingDetail = false; }
      });
    }
  }

  statusLabel(s: string): string {
    return ({ present: 'Hadir', late: 'Terlambat', absent: 'Belum Absen' } as any)[s] ?? s;
  }

  imgUrl(path: string): string {
    const base = environment.apiUrl.replace('/api', '');
    return `${base}/${path}`;
  }

  close() { this.modalCtrl.dismiss(); }
}
