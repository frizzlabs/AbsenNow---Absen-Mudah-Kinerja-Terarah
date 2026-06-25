import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileService } from '../../../core/services/profile.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-desktop-profile',
  templateUrl: './desktop-profile.page.html',
  styleUrls: ['./desktop-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TranslatePipe, BottomNavComponent],
})
export class DesktopProfilePage {
  user: any = null;
  canManageUsers = false;

  constructor(
    private profileService: ProfileService,
    private roleService: RoleService,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
  ) {}

  ionViewWillEnter() {
    const cached = localStorage.getItem('user');
    if (cached) {
      try { this.user = JSON.parse(cached); } catch {}
    }
    this.canManageUsers = this.roleService.can('users.manage');
    this.profileService.getProfile().subscribe({
      next: (u) => (this.user = u),
      error: () => {},
    });
    this.roleService.loadMyPermissions().subscribe({
      next: () => (this.canManageUsers = this.roleService.can('users.manage')),
      error: () => {},
    });
  }

  get roleLine(): string {
    if (!this.user) return '';
    return [this.user.job_title, this.user.department].filter(Boolean).join(' · ');
  }

  get initials(): string {
    if (!this.user?.name) return '?';
    return this.user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Keluar',
      message: 'Yakin ingin keluar dari AbsenNow?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Keluar',
          cssClass: 'alert-btn-danger',
          handler: () => {
            this.authService.logout();
            this.router.navigateByUrl('/auth/login', { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }
}
