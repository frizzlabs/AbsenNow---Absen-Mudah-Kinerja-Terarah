import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IdentityService } from '../../../core/services/identity.service';

@Component({
  selector: 'app-identity-form',
  templateUrl: './identity-form.page.html',
  styleUrls: ['./identity-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, SectionCardComponent, ButtonComponent]
})
export class IdentityFormPage {
  idType = 'ktp';
  idNumber = '';
  idName = '';
  idExpiry = '';

  photoFrontFile: File | null = null;
  photoFrontPreview: string | null = null;
  photoBackFile: File | null = null;
  photoBackPreview: string | null = null;

  isSubmitting = false;

  constructor(
    private identityService: IdentityService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  get isKtp() { return this.idType === 'ktp'; }

  get isValid() {
    return this.idType && this.idNumber.trim().length >= 6 && this.idName.trim().length >= 3 && this.photoFrontFile;
  }

  onFrontSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { this.toast('Ukuran file melebihi 8 MB.', 'warning'); return; }
    this.photoFrontFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.photoFrontPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  onBackSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { this.toast('Ukuran file melebihi 8 MB.', 'warning'); return; }
    this.photoBackFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.photoBackPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  async submit() {
    if (!this.isValid || this.isSubmitting) return;
    this.isSubmitting = true;

    const loading = await this.loadingCtrl.create({ message: 'Mengirim data identitas...' });
    await loading.present();

    this.identityService.submitIdentity({
      id_type: this.idType,
      id_number: this.idNumber.trim(),
      id_name: this.idName.trim(),
      id_expiry: this.idExpiry || undefined,
      photo_front: this.photoFrontFile!,
      photo_back: this.photoBackFile || undefined,
    }).subscribe({
      next: async () => {
        loading.dismiss();
        this.isSubmitting = false;
        await this.toast('Identitas berhasil dikirim, menunggu verifikasi.', 'success');
        this.router.navigateByUrl('/profile/identity/filled', { replaceUrl: true });
      },
      error: async (err) => {
        loading.dismiss();
        this.isSubmitting = false;
        await this.toast(err.error?.message || 'Gagal mengirim identitas.', 'danger');
      }
    });
  }

  async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2500, position: 'top', color });
    await t.present();
  }
}
