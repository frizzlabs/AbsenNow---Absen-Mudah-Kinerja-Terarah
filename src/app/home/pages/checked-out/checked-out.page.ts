import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-home-checked-out',
  templateUrl: './checked-out.page.html',
  styleUrls: ['./checked-out.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent, CardComponent, StatusBadgeComponent]
})
export class CheckedOutPage {
  @Input() currentLocation = 'Pemda Kota Bogor';

  constructor() {}
}
