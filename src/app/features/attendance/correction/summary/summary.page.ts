import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CorrectionService } from '../../../../core/services/correction.service';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PageHeaderComponent, ButtonComponent, BottomNavComponent]
})
export class SummaryPage {
  isSubmitting = false;

  constructor(
    private correctionService: CorrectionService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  get draft() { return this.correctionService.draft; }

  get dateFormatted(): string {
    if (!this.draft.date) return '-';
    return new Date(this.draft.date).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  get typeLabel(): string { return this.correctionService.typeLabelOf(this.draft.correctionType); }

  async submit() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({ message: 'Mengirim pengajuan...' });
    await loading.present();

    this.correctionService.submitCorrection(this.draft).subscribe({
      next: async (res) => {
        loading.dismiss();
        this.isSubmitting = false;
        this.correctionService.lastSubmitted = res.correction;
        this.correctionService.resetDraft();
        this.router.navigate(['/attendance/correction/submitted']);
      },
      error: async (err) => {
        loading.dismiss();
        this.isSubmitting = false;
        const msg = err.error?.message || 'Gagal mengirim pengajuan koreksi.';
        const toast = await this.toastCtrl.create({ message: msg, duration: 3000, position: 'top', color: 'danger' });
        await toast.present();
      }
    });
  }

  goBack() { this.router.navigate(['/attendance/correction/form']); }
}
