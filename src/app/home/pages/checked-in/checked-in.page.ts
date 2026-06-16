import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { SwipeButtonComponent } from '../../../shared/components/swipe-button/swipe-button.component';
import { AttendanceStateService } from '../../../core/services/attendance-state.service';

@Component({
  selector: 'app-home-checked-in',
  templateUrl: './checked-in.page.html',
  styleUrls: ['./checked-in.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent, CardComponent, StatusBadgeComponent, SwipeButtonComponent]
})
export class CheckedInPage {
  @Input() currentLocation = 'Pemda Kota Bogor';

  constructor(
    private router: Router,
    public attendanceStateService: AttendanceStateService
  ) {}

  onSwipeCheckOut() {
    this.router.navigate(['/attendance/validation']);
  }

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
}
