import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AttendanceStateService } from '../../../core/services/attendance-state.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home-checked-out',
  templateUrl: './checked-out.page.html',
  styleUrls: ['./checked-out.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent, CardComponent, StatusBadgeComponent, TranslatePipe]
})
export class CheckedOutPage {
  @Input() currentLocation = 'Mendeteksi lokasi…';
  @Input() currentTime = '12:45';
  @Input() currentTimeAmPm = 'PM';
  @Input() currentDate = 'Thursday, 12 Feb';
  @Input() greeting = 'Good Evening,';
  @Input() userName = 'Sarah';
  @Input() userAvatar = '';
  @Input() updates: any[] = [];
  @Output() onMoreClick = new EventEmitter<void>();

  constructor(
    private router: Router,
    public attendanceStateService: AttendanceStateService
  ) {}

  openUpdate(link: string) {
    if (!link) return;
    const [path, query] = link.split('?');
    if (query) {
      const params: any = {};
      query.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        params[k] = v;
      });
      this.router.navigate([path], { queryParams: params });
    } else {
      this.router.navigate([path]);
    }
  }

  formatTime24(timeStr: string | null): string {
    if (!timeStr) return '-:-';
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
      return timeStr;
    }
  }

  getHours(): string {
    const log = this.attendanceStateService.todayAttendance;
    if (!log || !log.check_in || !log.check_out) return '00';
    try {
      const [hIn, mIn] = log.check_in.split(':').map(Number);
      const [hOut, mOut] = log.check_out.split(':').map(Number);
      let diffMinutes = (hOut * 60 + mOut) - (hIn * 60 + mIn);
      if (diffMinutes < 0) return '00'; // Data tidak valid: keluar sebelum masuk
      const hours = Math.floor(diffMinutes / 60);
      return hours.toString().padStart(2, '0');
    } catch (e) {
      return '00';
    }
  }

  getMinutes(): string {
    const log = this.attendanceStateService.todayAttendance;
    if (!log || !log.check_in || !log.check_out) return '00';
    try {
      const [hIn, mIn] = log.check_in.split(':').map(Number);
      const [hOut, mOut] = log.check_out.split(':').map(Number);
      let diffMinutes = (hOut * 60 + mOut) - (hIn * 60 + mIn);
      if (diffMinutes < 0) return '00'; // Data tidak valid: keluar sebelum masuk
      const minutes = diffMinutes % 60;
      return minutes.toString().padStart(2, '0');
    } catch (e) {
      return '00';
    }
  }
}
