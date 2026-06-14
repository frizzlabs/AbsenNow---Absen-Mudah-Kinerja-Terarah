import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ButtonComponent]
})
export class OnboardingPage implements OnInit {
  activeIndex = 0;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  next() {
    if (this.activeIndex < 2) {
      this.activeIndex++;
    }
  }

  finish() {
    localStorage.setItem('isNewUser', 'false');
    this.router.navigate(['/auth/login']);
  }
}
