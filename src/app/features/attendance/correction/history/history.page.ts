import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CorrectionService } from '../../../../core/services/correction.service';
import { RoleService } from '../../../../core/services/role.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-correction-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent]
})
export class CorrectionHistoryPage {
  activeTab: 'pending' | 'reviewed' | 'mine' = 'pending';
  pendingItems: any[] = [];
  reviewedItems: any[] = [];
  myItems: any[] = [];
  isLoading = true;

  constructor(
    private correctionService: CorrectionService,
    private roleService: RoleService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  get canReview(): boolean {
    return this.roleService.can('attendance.approve');
  }

  ionViewWillEnter() {
    this.activeTab = this.canReview ? 'pending' : 'mine';
    this.load();
  }

  load() {
    this.isLoading = true;
    this.correctionService.getCorrections().subscribe({
      next: (data) => { this.myItems = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });

    if (this.canReview) {
      this.correctionService.getPendingReview().subscribe({
        next: (data) => { this.pendingItems = data; }
      });
      this.correctionService.getMyReviews().subscribe({
        next: (data) => { this.reviewedItems = data; }
      });
    }
  }

  setTab(tab: 'pending' | 'reviewed' | 'mine') { this.activeTab = tab; }

  async approve(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Setujui Koreksi?',
      message: `Setujui koreksi absensi dari ${item.user?.name}?`,
      inputs: [{ name: 'note', type: 'text', placeholder: 'Catatan (opsional)' }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Setujui', handler: (d) => { this.doReview(item.id, 'approved', d.note || ''); } }
      ]
    });
    await alert.present();
  }

  async reject(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Tolak Koreksi?',
      message: `Tolak koreksi absensi dari ${item.user?.name}?`,
      inputs: [{ name: 'note', type: 'text', placeholder: 'Alasan penolakan' }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Tolak', cssClass: 'alert-btn-danger', handler: (d) => { this.doReview(item.id, 'rejected', d.note || ''); } }
      ]
    });
    await alert.present();
  }

  doReview(id: number, status: 'approved' | 'rejected', note: string) {
    this.correctionService.reviewCorrection(id, status, note).subscribe({
      next: async () => {
        const msg = status === 'approved' ? 'Koreksi disetujui.' : 'Koreksi ditolak.';
        const t = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'top', color: status === 'approved' ? 'success' : 'danger' });
        await t.present();
        this.load();
      },
      error: async () => {
        const t = await this.toastCtrl.create({ message: 'Gagal memproses review.', duration: 2500, position: 'top', color: 'danger' });
        await t.present();
      }
    });
  }

  typeLabel(type: string): string { return this.correctionService.typeLabelOf(type); }
  statusLabel(s: string): string  { return this.correctionService.statusLabel(s); }
  statusColor(s: string): string  { return this.correctionService.statusColor(s); }

  formatDate(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatAt(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  ajukanBaru() { this.router.navigate(['/attendance/correction/reason']); }
}
