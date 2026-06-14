import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { SwipeButtonComponent } from '../../../shared/components/swipe-button/swipe-button.component';

@Component({
  selector: 'app-home-default-variant',
  templateUrl: './default-variant.page.html',
  styleUrls: ['./default-variant.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent, CardComponent, StatusBadgeComponent, SwipeButtonComponent]
})
export class DefaultVariantPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  onSwipeCheckIn() {
    this.router.navigate(['/attendance/validation']);
  }
}
