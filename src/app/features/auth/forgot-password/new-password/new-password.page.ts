import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthHeaderIconComponent } from '../../../../shared/components/auth-header-icon/auth-header-icon.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.page.html',
  styleUrls: ['./new-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, AuthHeaderIconComponent, InputComponent, ButtonComponent]
})
export class NewPasswordPage implements OnInit {
  password = '';
  passwordConfirm = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    if (!localStorage.getItem('reset_token')) {
      this.router.navigateByUrl('/auth/forgot-password/email', { replaceUrl: true });
    }
  }

  async resetPassword() {
    if (!this.password || !this.passwordConfirm) {
      const t = await this.toastController.create({ message: 'Isi semua field.', duration: 2000, position: 'top', color: 'warning' });
      await t.present(); return;
    }
    if (this.password.length < 8) {
      const t = await this.toastController.create({ message: 'Password minimal 8 karakter.', duration: 2000, position: 'top', color: 'warning' });
      await t.present(); return;
    }
    if (this.password !== this.passwordConfirm) {
      const t = await this.toastController.create({ message: 'Password tidak cocok.', duration: 2000, position: 'top', color: 'danger' });
      await t.present(); return;
    }

    this.isLoading = true;
    this.authService.resetPassword(this.password, this.passwordConfirm).subscribe({
      next: async () => {
        this.isLoading = false;
        const t = await this.toastController.create({ message: 'Password berhasil direset! Silakan login.', duration: 3000, position: 'top', color: 'success' });
        await t.present();
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
      error: async (err) => {
        this.isLoading = false;
        const t = await this.toastController.create({
          message: err.error?.message || 'Gagal reset password. Coba lagi.',
          duration: 3000, position: 'top', color: 'danger'
        });
        await t.present();
      }
    });
  }
}
