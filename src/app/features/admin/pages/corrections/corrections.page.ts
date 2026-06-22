import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CorrectionService } from '../../../../core/services/correction.service';
import { RoleService } from '../../../../core/services/role.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-corrections',
  templateUrl: './corrections.page.html',
  styleUrls: ['./corrections.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PageHeaderComponent]
})
export class AdminCorrectionsPage {
  pendingItems: any[] = [];
  reviewedItems: any[] = [];
  allItems: any[] = [];
  isLoading = true;
  activeTab: 'pending' | 'reviewed' | 'all' = 'pending';

  get items(): any[] {
    if (this.activeTab === 'all') {
      return this.allItems;
    } else if (this.activeTab === 'reviewed') {
      return this.reviewedItems;
    } else {
      return this.pendingItems;
    }
  }

  reviewNotes: Record<number, string> = {};
  reviewingId: number | null = null;
  expandedId: number | null = null;

  constructor(
    private correctionService: CorrectionService,
    private roleService: RoleService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  get canSeeAll(): boolean {
    return this.roleService.can('attendance.manage');
  }

  ionViewWillEnter() { this.load(); }

  load() {
    this.isLoading = true;
    let obs;
    if (this.activeTab === 'all' && this.canSeeAll) {
      obs = this.correctionService.getAdminCorrections();
    } else if (this.activeTab === 'reviewed') {
      obs = this.correctionService.getMyReviews();
    } else {
      obs = this.correctionService.getPendingReview();
    }

    obs.subscribe({
      next: (data) => {
        if (this.activeTab === 'all') {
          this.allItems = data;
        } else if (this.activeTab === 'reviewed') {
          this.reviewedItems = data;
        } else {
          this.pendingItems = data;
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  setTab(tab: 'pending' | 'reviewed' | 'all') {
    this.activeTab = tab;
    this.expandedId = null;
    this.load();
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  typeLabel(type: string): string { return this.correctionService.typeLabelOf(type); }
  statusLabel(s: string): string  { return this.correctionService.statusLabel(s); }
  statusColor(s: string): string  { return this.correctionService.statusColor(s); }

  formatDate(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  async approve(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Setujui Koreksi',
      message: `Setujui koreksi absensi ${item.user?.name} tanggal ${this.formatDate(item.correction_date)}?`,
      inputs: [{
        name: 'note',
        type: 'textarea',
        placeholder: 'Catatan (opsional)',
        value: this.reviewNotes[item.id] || ''
      }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Setujui',
          cssClass: 'alert-btn-success',
          handler: (data) => { this.doReview(item.id, 'approved', data.note || ''); }
        }
      ]
    });
    await alert.present();
  }

  async reject(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Tolak Koreksi',
      message: `Tolak koreksi absensi ${item.user?.name}?`,
      inputs: [{
        name: 'note',
        type: 'textarea',
        placeholder: 'Alasan penolakan (wajib)',
        value: this.reviewNotes[item.id] || ''
      }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Tolak',
          cssClass: 'alert-btn-danger',
          handler: (data) => {
            if (!data.note?.trim()) {
              this.toast('Alasan penolakan harus diisi.', 'warning');
              return false;
            }
            this.doReview(item.id, 'rejected', data.note);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  doReview(id: number, status: 'approved' | 'rejected', note: string) {
    this.reviewingId = id;
    this.correctionService.reviewCorrection(id, status, note).subscribe({
      next: async () => {
        this.reviewingId = null;
        this.expandedId = null;
        await this.toast(
          status === 'approved' ? 'Koreksi berhasil disetujui.' : 'Koreksi ditolak.',
          status === 'approved' ? 'success' : 'danger'
        );
        this.load();

        // Refresh pending count if reviewed from another tab to keep the badge in sync
        if (this.activeTab !== 'pending') {
          this.correctionService.getPendingReview().subscribe({
            next: (data) => { this.pendingItems = data; }
          });
        }
      },
      error: async (err) => {
        this.reviewingId = null;
        await this.toast(err.error?.message || 'Gagal memproses.', 'danger');
      }
    });
  }

  async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2500, position: 'top', color });
    await t.present();
  }

  goBack() { this.router.navigate(['/home']); }
}
