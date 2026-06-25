import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DinasLuarService } from '../../../../core/services/dinas-luar.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PageHeaderComponent, ButtonComponent, BottomNavComponent]
})
export class ConfirmPage {
  isSubmitting = false;

  constructor(
    public dinasService: DinasLuarService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  get draft() { return this.dinasService.draft; }

  fmtDt(iso: string): string { return iso ? this.dinasService.formatDt(iso) : '-'; }

  async submit() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({ message: 'Mengirim pengajuan...' });
    await loading.present();

    this.dinasService.submit(this.draft).subscribe({
      next: async () => {
        await loading.dismiss();
        this.router.navigate(['/dinas-luar/submitted'], { queryParams: { type: 'ajukan' } });
      },
      error: async (err) => {
        await loading.dismiss();
        this.isSubmitting = false;
        const msg = err.error?.message || err.error?.errors ? JSON.stringify(err.error.errors) : 'Gagal mengirim pengajuan.';
        const t = await this.toastCtrl.create({ message: msg, duration: 3000, position: 'top', color: 'danger' });
        await t.present();
      }
    });
  }

  goBack() { this.router.navigate(['/dinas-luar/ajukan']); }
}
