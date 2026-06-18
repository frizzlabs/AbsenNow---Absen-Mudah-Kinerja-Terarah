import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService, PermissionModule } from '../../../../core/services/role.service';

@Component({
  selector: 'app-admin-role-detail',
  templateUrl: './role-detail.page.html',
  styleUrls: ['./role-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RoleDetailPage {
  roleId!: number;
  role: any = null;
  modules: PermissionModule[] = [];
  selected: { [id: number]: boolean } = {};
  isLoading = true;
  isSaving = false;
  isSuperadmin = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.roleId = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load() {
    this.isLoading = true;
    this.roleService.getRole(this.roleId).subscribe({
      next: (res) => {
        this.role = res.role;
        this.modules = res.modules;
        this.isSuperadmin = res.role.name === 'superadmin';
        this.selected = {};
        // superadmin selalu semua tercentang
        res.modules.forEach(m => m.permissions.forEach(p => {
          this.selected[p.id] = this.isSuperadmin || res.assigned.includes(p.id);
        }));
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  toggle(id: number) {
    if (this.isSuperadmin) return;
    this.selected[id] = !this.selected[id];
  }

  moduleAllChecked(m: PermissionModule): boolean {
    return m.permissions.every(p => this.selected[p.id]);
  }

  toggleModule(m: PermissionModule) {
    if (this.isSuperadmin) return;
    const target = !this.moduleAllChecked(m);
    m.permissions.forEach(p => this.selected[p.id] = target);
  }

  get selectedCount(): number {
    return Object.values(this.selected).filter(Boolean).length;
  }

  async save() {
    if (this.isSuperadmin) {
      this.showToast('Super Admin selalu punya akses penuh.', 'warning');
      return;
    }
    if (this.isSaving) return;
    this.isSaving = true;

    const ids = Object.keys(this.selected).filter(k => this.selected[+k]).map(k => +k);
    const loading = await this.loadingCtrl.create({ message: 'Menyimpan privilege...' });
    await loading.present();

    this.roleService.updateRolePermissions(this.roleId, ids).subscribe({
      next: async () => {
        loading.dismiss();
        this.isSaving = false;
        await this.showToast('Privilege berhasil disimpan.', 'success');
        this.router.navigate(['/admin/roles']);
      },
      error: async (err) => {
        loading.dismiss();
        this.isSaving = false;
        await this.showToast(err.error?.message || 'Gagal menyimpan privilege.', 'danger');
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/roles']);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2500, position: 'top', color });
    await toast.present();
  }
}
