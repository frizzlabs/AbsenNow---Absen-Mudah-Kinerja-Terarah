import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { SwipeButtonComponent } from '../../../shared/components/swipe-button/swipe-button.component';
import { AttendanceStateService } from '../../../core/services/attendance-state.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home-checked-in',
  templateUrl: './checked-in.page.html',
  styleUrls: ['./checked-in.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent, CardComponent, StatusBadgeComponent, SwipeButtonComponent, TranslatePipe]
})
export class CheckedInPage {
  @Input() currentLocation = 'Mendeteksi lokasi…';
  @Input() currentTime = '12:45';
  @Input() currentTimeAmPm = 'PM';
  @Input() currentDate = 'Thursday, 12 Feb';
  @Input() greeting = 'Good Morning,';
  @Input() userName = 'Sarah';
  @Input() userAvatar = '';
  @Input() updates: any[] = [];
  @Output() onMoreClick = new EventEmitter<void>();

  constructor(
    private router: Router,
    public attendanceStateService: AttendanceStateService
  ) {}

  onSwipeCheckOut() {
    this.router.navigate(['/attendance/validation']);
  }

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

  getWorkingTime(): string {
    const checkInStr = this.attendanceStateService.todayAttendance?.check_in;
    if (!checkInStr) return '00:00:00';
    try {
      const [hIn, mIn, sIn = 0] = checkInStr.split(':').map(Number);
      const now = new Date();
      const checkInDate = new Date();
      checkInDate.setHours(hIn, mIn, sIn, 0);

      let diffMs = now.getTime() - checkInDate.getTime();
      if (diffMs < 0) diffMs = 0;

      const diffSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } catch (e) {
      return '00:00:00';
    }
  }
}
