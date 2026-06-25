import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ProfileService } from '../../../core/services/profile.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-edit-personal-info',
  templateUrl: './edit-personal-info.page.html',
  styleUrls: ['./edit-personal-info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, SectionCardComponent, ButtonComponent, InputComponent, BottomNavComponent]
})
export class EditPersonalInfoPage {
  user: any = null;
  previewUrl: string | null = null;
  isUploading = false;
  isSaving = false;

  model = {
    phone: '',
    personal_email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: ''
  };

  relationshipOptions = ['Pasangan', 'Orang Tua', 'Saudara', 'Anak', 'Teman', 'Lainnya'];

  showRelationshipDropdown = false;

  get relationshipLabel(): string {
    return this.model.emergency_contact_relationship || 'Pilih hubungan...';
  }

  selectRelationship(value: string) {
    this.model.emergency_contact_relationship = value;
    this.showRelationshipDropdown = false;
  }

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    const cached = localStorage.getItem('user');
    if (cached) {
      try { this.applyUser(JSON.parse(cached)); } catch (e) {}
    }
    this.profileService.getProfile().subscribe({
      next: (u) => this.applyUser(u),
      error: () => {}
    });
  }

  private applyUser(u: any) {
    this.user = u;
    this.model = {
      phone: u.phone || '',
      personal_email: u.personal_email || '',
      address: u.address || '',
      emergency_contact_name: u.emergency_contact_name || '',
      emergency_contact_relationship: u.emergency_contact_relationship || '',
      emergency_contact_phone: u.emergency_contact_phone || ''
    };
  }

  get dobLabel(): string {
    if (!this.user?.date_of_birth) return '-';
    try {
      return new Date(this.user.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return this.user.date_of_birth;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      this.toast('Ukuran file melebihi 4 MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => { this.previewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);

    this.isUploading = true;
    this.profileService.uploadAvatar(file).subscribe({
      next: async (res) => {
        this.isUploading = false;
        if (res?.user) this.user = res.user;
        await this.toast('Foto profil berhasil diperbarui.', 'success');
      },
      error: async (err) => {
        this.isUploading = false;
        this.previewUrl = null;
        await this.toast(err.error?.message || 'Gagal mengunggah foto.', 'danger');
      }
    });

    input.value = '';
  }

  async save() {
    if (this.isSaving) return;
    this.isSaving = true;

    const loading = await this.loadingCtrl.create({ message: 'Menyimpan...' });
    await loading.present();

    this.profileService.updateProfile(this.model).subscribe({
      next: async () => {
        loading.dismiss();
        this.isSaving = false;
        await this.toast('Profil berhasil diperbarui.', 'success');
        this.router.navigate(['/home']);
      },
      error: async (err) => {
        loading.dismiss();
        this.isSaving = false;
        await this.toast(err.error?.message || 'Gagal memperbarui profil.', 'danger');
      }
    });
  }

  cancel() {
    this.router.navigate(['/home']);
  }

  async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2500, position: 'top', color });
    await t.present();
  }
}
