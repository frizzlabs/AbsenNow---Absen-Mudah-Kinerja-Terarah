import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RoleService } from '../../../../core/services/role.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PageHeaderComponent]
})
export class AdminUsersPage {
  users: any[] = [];
  roles: any[] = [];
  isLoading = true;
  savingId: number | null = null;

  edit: { [id: number]: { roleId: number | null; position: string } } = {};

  constructor(
    private router: Router,
    private roleService: RoleService,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.roleService.getRoles().subscribe({ next: (r) => (this.roles = r), error: () => {} });
    this.roleService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.edit = {};
        data.forEach(u => this.edit[u.id] = { roleId: u.role?.id ?? null, position: u.position || '' });
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  async save(user: any) {
    const e = this.edit[user.id];
    if (!e.roleId) {
      this.showToast('Pilih role terlebih dahulu.', 'warning');
      return;
    }
    this.savingId = user.id;
    this.roleService.updateUserRole(user.id, e.roleId, e.position).subscribe({
      next: async (res) => {
        this.savingId = null;
        user.role = res.user?.role ? { id: res.user.role.id, name: res.user.role.name, label: res.user.role.label } : user.role;
        user.position = e.position;
        await this.showToast('Role pengguna disimpan.', 'success');
      },
      error: async (err) => {
        this.savingId = null;
        await this.showToast(err.error?.message || 'Gagal menyimpan.', 'danger');
      }
    });
  }

  roleBadgeClass(name: string): string {
    return name || 'none';
  }

  goBack() {
    this.router.navigate(['/admin/roles']);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2200, position: 'top', color });
    await toast.present();
  }
}
