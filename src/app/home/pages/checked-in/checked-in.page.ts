import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { SwipeButtonComponent } from '../../../shared/components/swipe-button/swipe-button.component';

@Component({
  selector: 'app-home-checked-in',
  templateUrl: './checked-in.page.html',
  styleUrls: ['./checked-in.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent, CardComponent, StatusBadgeComponent, SwipeButtonComponent]
})
export class CheckedInPage {
  constructor(private router: Router) {}

  onSwipeCheckOut() {
    this.router.navigate(['/attendance/validation']);
  }
}
