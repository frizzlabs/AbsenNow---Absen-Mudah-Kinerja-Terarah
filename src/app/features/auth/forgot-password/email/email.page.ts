import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthHeaderIconComponent } from '../../../../shared/components/auth-header-icon/auth-header-icon.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-email',
  templateUrl: './email.page.html',
  styleUrls: ['./email.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, AuthHeaderIconComponent, InputComponent, ButtonComponent]
})
export class EmailPage {
  email = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  async sendCode() {
    if (!this.email) {
      const toast = await this.toastController.create({ message: 'Masukkan email kamu.', duration: 2000, position: 'top', color: 'warning' });
      await toast.present();
      return;
    }
    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/auth/forgot-password/verification');
      },
      error: async (err) => {
        this.isLoading = false;
        const toast = await this.toastController.create({
          message: err.error?.message || 'Gagal mengirim kode. Coba lagi.',
          duration: 3000, position: 'top', color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
