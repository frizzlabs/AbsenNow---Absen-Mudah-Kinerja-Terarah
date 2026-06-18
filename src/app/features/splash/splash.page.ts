import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SplashPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    setTimeout(() => {
      const isNewUser = localStorage.getItem('isNewUser') !== 'false';
      const hasPin = localStorage.getItem('hasPin') === 'true';
      const token = localStorage.getItem('auth_token');

      if (isNewUser) {
        this.router.navigateByUrl('/onboarding', { replaceUrl: true });
      } else if (hasPin) {
        // Punya PIN → langsung ke verify PIN (tidak perlu OTP lagi)
        this.router.navigateByUrl('/auth/device-pin/verify', { replaceUrl: true });
      } else if (token) {
        // Token masih ada tapi belum set PIN
        this.router.navigateByUrl('/home', { replaceUrl: true });
      } else {
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      }
    }, 2000);
  }

}
