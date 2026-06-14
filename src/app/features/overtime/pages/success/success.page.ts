import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overtime-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SuccessPage {
  constructor(private router: Router) {}

  backToPermission() {
    this.router.navigate(['/overtime']);
  }

  goToApproval() {
    this.router.navigate(['/overtime']);
  }
}
