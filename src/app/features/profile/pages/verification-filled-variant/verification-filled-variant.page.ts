import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-verification-filled-variant',
  templateUrl: './verification-filled-variant.page.html',
  styleUrls: ['./verification-filled-variant.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class VerificationFilledVariantPage {
  constructor() {}
}
