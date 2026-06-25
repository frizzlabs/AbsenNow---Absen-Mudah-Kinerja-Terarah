import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-profile-verification-filled-variant',
  templateUrl: './verification-filled-variant.page.html',
  styleUrls: ['./verification-filled-variant.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent]
})
export class VerificationFilledVariantPage {
  constructor() {}
}
