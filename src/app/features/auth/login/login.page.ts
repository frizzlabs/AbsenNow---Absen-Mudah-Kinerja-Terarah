import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { TenantService, TenantBranding } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, InputComponent, ButtonComponent]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  branding: TenantBranding | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService,
    private toastController: ToastController,
    private tenant: TenantService
  ) { }

  ngOnInit() {
    this.tenant.load();
    this.tenant.branding$.subscribe((b) => (this.branding = b));
  }

  async signIn() {
    if (!this.email || !this.password) {
      const toast = await this.toastController.create({
        message: 'Please enter both email and password.',
        duration: 3000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.access_token) {
          const destination = res.user?.device_pin ? '/home' : '/auth/device-pin/create';
          this.roleService.loadMyPermissions().subscribe({
            next: () => this.router.navigateByUrl(destination),
            error: () => this.router.navigateByUrl(destination),
          });
        } else if (res?.has_pin) {
          this.router.navigateByUrl('/auth/device-pin/verify');
        } else {
          this.router.navigateByUrl('/auth/login-verification');
        }
      },
      error: async (err) => {
        this.isLoading = false;
        const toast = await this.toastController.create({
          message: err.error?.message || 'Login failed. Please check your credentials.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
