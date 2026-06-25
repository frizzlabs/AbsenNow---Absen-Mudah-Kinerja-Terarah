import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthHeaderIconComponent } from '../../../../shared/components/auth-header-icon/auth-header-icon.component';
import { PinDotsComponent } from '../../../../shared/components/pin-dots/pin-dots.component';
import { NumpadComponent } from '../../../../shared/components/numpad/numpad.component';

import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RoleService } from '../../../../core/services/role.service';

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
    private roleService: RoleService,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    const user = this.authService.getUser();
    const tempEmail = localStorage.getItem('temp_email');  // dari login email+password
    const pinEmail = localStorage.getItem('pin_email');    // dari setup PIN sebelumnya
    if (user?.email) {
      this.email = user.email;
    } else if (tempEmail) {
      // Prioritaskan email login aktif sekarang (bukan PIN lama device lain)
      this.email = tempEmail;
    } else if (pinEmail) {
      this.email = pinEmail;
    } else {
      this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    }
  }
  
  async forgotPin() {
    const alert = await this.alertController.create({
      header: 'Lupa PIN?',
      message: 'Kami akan mengirimkan kode OTP ke email Anda untuk mengatur ulang PIN.',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Kirim OTP',
          handler: () => {
            this.sendForgotPinOtp();
          }
        }
      ]
    });
    await alert.present();
  }

  async sendForgotPinOtp() {
    const loading = await this.loadingController.create({
      message: 'Mengirim OTP...',
    });
    await loading.present();

    this.authService.forgotPin(this.email).subscribe({
      next: async (res) => {
        await loading.dismiss();
        localStorage.setItem('temp_email', this.email);
        localStorage.removeItem('hasPin');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('auth_token');

        this.router.navigate(['/auth/login-verification'], {
          queryParams: { mode: 'forgot-pin' }
        });
      },
      error: async (err) => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: err.error?.message || 'Gagal mengirim OTP. Silakan coba lagi.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
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
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('hasPin', 'true');
            localStorage.setItem('pin_email', this.email);
            localStorage.removeItem('temp_email');
            
            // Preload role sebelum navigasi agar home page tidak flash
            this.roleService.loadMyPermissions().subscribe({
              next: () => {
                this.isLoading = false;
                this.router.navigateByUrl('/home', { replaceUrl: true });
              },
              error: () => {
                this.isLoading = false;
                this.router.navigateByUrl('/home', { replaceUrl: true });
              },
            });
          },
          error: async (err) => {
            this.isLoading = false;
            this.pinValue = '';
            const toast = await this.toastController.create({
              message: err.error?.message || 'Kode PIN salah.',
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
