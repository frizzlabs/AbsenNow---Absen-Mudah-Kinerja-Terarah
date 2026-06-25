import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { ProfileMenuItemComponent } from '../../shared/components/profile-menu-item/profile-menu-item.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileService } from '../../core/services/profile.service';
import { RoleService } from '../../core/services/role.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, ProfileMenuItemComponent, BottomNavComponent, TranslatePipe]
})
export class ProfilePage {
  user: any = null;
  canManageUsers = false;

  constructor(
    private profileService: ProfileService,
    private roleService: RoleService,
    private authService: AuthService,
    private alertController: AlertController,
    private platform: Platform,
    private router: Router
  ) {}

  ionViewWillEnter() {
    const cached = localStorage.getItem('user');
    if (cached) {
      try { this.user = JSON.parse(cached); } catch (e) {}
    }
    this.canManageUsers = this.roleService.can('users.manage');
    this.profileService.getProfile().subscribe({
      next: (u) => (this.user = u),
      error: () => {}
    });
    this.roleService.loadMyPermissions().subscribe({
      next: () => (this.canManageUsers = this.roleService.can('users.manage')),
      error: () => {}
    });
  }

  get roleLine(): string {
    if (!this.user) return '';
    const parts = [this.user.job_title, this.user.department].filter(Boolean);
    return parts.join(' • ');
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Keluar',
      message: 'Yakin ingin keluar dari AbsenNow?',
      buttons: [
        { text: 'Batal', role: 'cancel', cssClass: 'alert-btn-cancel' },
        {
          text: 'Keluar',
          cssClass: 'alert-btn-danger',
          handler: () => {
            this.authService.logout();
            this.router.navigateByUrl('/auth/login', { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }
}
