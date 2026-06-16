import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AttendanceStateService } from '../../../core/services/attendance-state.service';

@Component({
  selector: 'app-home-checked-out',
  templateUrl: './checked-out.page.html',
  styleUrls: ['./checked-out.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent, CardComponent, StatusBadgeComponent]
})
export class CheckedOutPage {
  @Input() currentLocation = 'Pemda Kota Bogor';

  constructor(public attendanceStateService: AttendanceStateService) {}

  formatTime12(timeStr: string | null): string {
    if (!timeStr) return '-:-';
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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
      if (diffMinutes < 0) diffMinutes += 24 * 60;
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
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      const minutes = diffMinutes % 60;
      return minutes.toString().padStart(2, '0');
    } catch (e) {
      return '00';
    }
  }
}
