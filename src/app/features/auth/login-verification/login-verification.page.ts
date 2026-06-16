import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AuthHeaderIconComponent } from '../../../shared/components/auth-header-icon/auth-header-icon.component';
import { OtpInputComponent } from '../../../shared/components/otp-input/otp-input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NumpadComponent } from '../../../shared/components/numpad/numpad.component';

import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login-verification',
  templateUrl: './login-verification.page.html',
  styleUrls: ['./login-verification.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, AuthHeaderIconComponent, OtpInputComponent, ButtonComponent, NumpadComponent]
})
export class LoginVerificationPage implements OnInit {
  otpValue: string = '';
  tempEmail: string = '';
  isLoading: boolean = false;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.tempEmail = localStorage.getItem('temp_email') || 'your email';
  }
  
  onKeyPress(key: string) {
    if (key === 'backspace') {
      this.otpValue = this.otpValue.slice(0, -1);
    } else if (this.otpValue.length < 6) {
      this.otpValue += key;
    }
  }

  async verifyOtp() {
    if (this.otpValue.length < 6) {
      const toast = await this.toastController.create({
        message: 'Please enter a 6-digit OTP code.',
        duration: 3000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    this.authService.verifyOtp(this.otpValue).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/auth/device-pin/create');
      },
      error: async (err) => {
        this.isLoading = false;
        const toast = await this.toastController.create({
          message: err.error?.message || 'Verification failed. Please check the code.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
