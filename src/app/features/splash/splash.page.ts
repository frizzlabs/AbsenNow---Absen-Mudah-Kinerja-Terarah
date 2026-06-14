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
      // Demo startup flow
      this.router.navigateByUrl('/onboarding', { replaceUrl: true });

      /*
      // Production startup flow
      const isNewUser = localStorage.getItem('isNewUser') !== 'false';
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const hasPin = localStorage.getItem('hasPin') === 'true';

      if (isNewUser) {
        this.router.navigateByUrl('/onboarding', { replaceUrl: true });
      } else if (!isLoggedIn) {
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      } else if (hasPin) {
        this.router.navigateByUrl('/auth/device-pin/verify', { replaceUrl: true });
      } else {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
      */
    }, 2000);
  }

}
