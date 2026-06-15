import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { BottomNavComponent } from '../shared/components/bottom-nav/bottom-nav.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { CardComponent } from '../shared/components/card/card.component';
import { AttendanceStateService } from '../core/services/attendance-state.service';
import { CheckedInPage } from './pages/checked-in/checked-in.page';
import { CheckedOutPage } from './pages/checked-out/checked-out.page';
import { SwipeButtonComponent } from '../shared/components/swipe-button/swipe-button.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent, StatusBadgeComponent, CardComponent, RouterModule, CheckedInPage, CheckedOutPage, SwipeButtonComponent, TranslatePipe],
})
export class HomePage {
  constructor(public attendanceService: AttendanceStateService, private router: Router) {}

  get viewState() {
    if (this.attendanceService.state === 'checked_in') return 'checked_in';
    if (this.attendanceService.hasCompletedToday) return 'completed';
    return 'default';
  }

  showShortcuts: boolean = false;

  toggleShortcuts() {
    this.showShortcuts = !this.showShortcuts;
  }

  onSwipeCheckIn() {
    this.router.navigate(['/attendance/validation']);
  }
}
