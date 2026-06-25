import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RoleService } from '../../../../core/services/role.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { UploadBoxComponent } from '../../../../shared/components/upload-box/upload-box.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PageHeaderComponent, InputComponent, ButtonComponent, UploadBoxComponent, BottomNavComponent]
})
export class AdminUsersPage {
  users: any[] = [];
  roles: any[] = [];
  isLoading = true;
  savingId: number | null = null;

  // Add/Edit/Import modal states
  showAddModal = false;
  showEditModal = false;
  showImportModal = false;

  // Editing user fields
  editingUser: any = null;
  editUserRoleId: number | null = null;
  editUserPos = '';

  // New user form fields
  newUserName = '';
  newUserEmail = '';
  newUserPassword = '';
  newUserRoleId: number | null = null;
  newUserDept = '';
  newUserPos = '';
  newUserEmpId = '';

  // CSV Import fields
  selectedCsvFile: File | null = null;
  csvSizeText = '';
  isUploading = false;

  // Custom dropdown states
  showNewUserRoleDropdown = false;
  newUserRoleLabel = '— Pilih role —';
  showEditUserRoleDropdown = false;
  editUserRoleLabel = '— Pilih role —';

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
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  openEditUser(user: any) {
    this.editingUser = user;
    this.editUserRoleId = user.role?.id ?? null;
    this.editUserRoleLabel = user.role?.label ?? '— Pilih role —';
    this.editUserPos = user.position || '';
    this.showEditModal = true;
  }

  saveEditUser() {
    if (!this.editingUser) return;
    if (!this.editUserRoleId) {
      this.showToast('Pilih role terlebih dahulu.', 'warning');
      return;
    }
    this.savingId = this.editingUser.id;
    this.roleService.updateUserRole(this.editingUser.id, this.editUserRoleId, this.editUserPos).subscribe({
      next: async (res) => {
        this.savingId = null;
        this.showEditModal = false;
        await this.showToast('Pengguna berhasil diperbarui.', 'success');
        this.load();
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

  createUser() {
    if (!this.newUserName || !this.newUserEmail || !this.newUserPassword) {
      this.showToast('Nama, Email, dan Password wajib diisi.', 'warning');
      return;
    }
    const payload = {
      name: this.newUserName,
      email: this.newUserEmail,
      password: this.newUserPassword,
      role_id: this.newUserRoleId,
      department: this.newUserDept || null,
      position: this.newUserPos || null,
      employee_id: this.newUserEmpId || null,
    };
    this.roleService.createUser(payload).subscribe({
      next: async () => {
        this.showAddModal = false;
        // Reset form
        this.newUserName = '';
        this.newUserEmail = '';
        this.newUserPassword = '';
        this.newUserRoleId = null;
        this.newUserRoleLabel = '— Pilih role —';
        this.newUserDept = '';
        this.newUserPos = '';
        this.newUserEmpId = '';
        await this.showToast('Pengguna berhasil dibuat.', 'success');
        this.load();
      },
      error: async (err) => {
        await this.showToast(err.error?.message || 'Gagal membuat pengguna.', 'danger');
      }
    });
  }

  onFileSelected(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.selectedCsvFile = fileList[0];
      const sizeInMB = (this.selectedCsvFile.size / (1024 * 1024)).toFixed(2);
      this.csvSizeText = `${sizeInMB} MB`;
    }
  }

  uploadCsv() {
    if (!this.selectedCsvFile) {
      this.showToast('Pilih file CSV terlebih dahulu.', 'warning');
      return;
    }
    this.isUploading = true;
    this.roleService.importUsersCsv(this.selectedCsvFile).subscribe({
      next: async (res) => {
        this.isUploading = false;
        this.showImportModal = false;
        this.selectedCsvFile = null;
        this.csvSizeText = '';
        await this.showToast(`Import selesai. Sukses: ${res.imported}, Skip: ${res.skipped?.length || 0}`, 'success');
        this.load();
      },
      error: async (err) => {
        this.isUploading = false;
        await this.showToast(err.error?.message || 'Gagal mengimpor CSV.', 'danger');
      }
    });
  }

  selectNewUserRole(role: any) {
    this.newUserRoleId = role ? role.id : null;
    this.newUserRoleLabel = role ? role.label : '— Pilih role —';
    this.showNewUserRoleDropdown = false;
  }

  selectEditUserRole(role: any) {
    this.editUserRoleId = role ? role.id : null;
    this.editUserRoleLabel = role ? role.label : '— Pilih role —';
    this.showEditUserRoleDropdown = false;
  }
}
