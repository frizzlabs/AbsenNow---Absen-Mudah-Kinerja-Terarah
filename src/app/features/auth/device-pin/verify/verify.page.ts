import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthHeaderIconComponent } from '../../../../shared/components/auth-header-icon/auth-header-icon.component';
import { PinDotsComponent } from '../../../../shared/components/pin-dots/pin-dots.component';
import { NumpadComponent } from '../../../../shared/components/numpad/numpad.component';

import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, AuthHeaderIconComponent, PinDotsComponent, NumpadComponent]
})
export class VerifyPage implements OnInit {
  pinValue: string = '';
  email: string = '';
  isLoading: boolean = false;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    const user = this.authService.getUser();
    if (user && user.email) {
      this.email = user.email;
    } else {
      this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    }
  }
  
  async onKeyPress(key: string) {
    if (this.isLoading) return;

    if (key === 'backspace') {
      this.pinValue = this.pinValue.slice(0, -1);
    } else if (this.pinValue.length < 4) {
      this.pinValue += key;
      if (this.pinValue.length === 4) {
        this.isLoading = true;
        this.authService.verifyPin(this.email, this.pinValue).subscribe({
          next: () => {
            this.isLoading = false;
            localStorage.setItem('isLoggedIn', 'true');
            setTimeout(() => this.router.navigateByUrl('/home', { replaceUrl: true }), 300);
          },
          error: async (err) => {
            this.isLoading = false;
            this.pinValue = '';
            const toast = await this.toastController.create({
              message: err.error?.message || 'Incorrect PIN code.',
              duration: 3000,
              position: 'top',
              color: 'danger'
            });
            await toast.present();
          }
        });
      }
    }
  }
}
