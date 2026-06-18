import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { RoleService } from '../../../core/services/role.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login-verification',
  templateUrl: './login-verification.page.html',
  styleUrls: ['./login-verification.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, AuthHeaderIconComponent, OtpInputComponent, ButtonComponent, NumpadComponent]
})
export class LoginVerificationPage implements OnInit, OnDestroy {
  otpValue: string = '';
  tempEmail: string = '';
  isLoading: boolean = false;
  countdown: number = 0;
  private countdownInterval: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.tempEmail = localStorage.getItem('temp_email') || 'your email';
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  get isBlocked(): boolean { return this.countdown > 0; }

  get countdownLabel(): string {
    const m = Math.floor(this.countdown / 60);
    const s = this.countdown % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  private startCountdown(seconds: number) {
    this.stopCountdown();
    this.countdown = seconds;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) this.stopCountdown();
    }, 1000);
  }

  private stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdown = 0;
  }

  onKeyPress(key: string) {
    if (this.isBlocked) return;
    if (key === 'backspace') {
      this.otpValue = this.otpValue.slice(0, -1);
    } else if (this.otpValue.length < 6) {
      this.otpValue += key;
    }
  }

  async verifyOtp() {
    if (this.isBlocked || this.otpValue.length < 6) return;

    this.isLoading = true;
    this.authService.verifyOtp(this.otpValue).subscribe({
      next: (res) => {
        this.isLoading = false;
        const destination = res?.user?.device_pin ? '/home' : '/auth/device-pin/create';
        // Preload role sebelum navigasi agar home page tidak flash
        this.roleService.loadMyPermissions().subscribe({
          next: () => this.router.navigateByUrl(destination),
          error: () => this.router.navigateByUrl(destination),
        });
      },
      error: async (err) => {
        this.isLoading = false;
        const status = err.status;
        const message = err.error?.message || 'Verifikasi gagal.';
        if (status === 429) {
          const retryAfter = parseInt(err.headers?.get('Retry-After') || '60', 10);
          this.startCountdown(retryAfter);
          this.otpValue = '';
        }
        const toast = await this.toastController.create({
          message,
          duration: 3000,
          position: 'top',
          color: status === 429 ? 'warning' : 'danger'
        });
        await toast.present();
      }
    });
  }
}
