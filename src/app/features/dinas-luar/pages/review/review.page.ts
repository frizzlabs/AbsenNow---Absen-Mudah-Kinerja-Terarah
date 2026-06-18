import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DinasLuarService } from '../../../../core/services/dinas-luar.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dinas-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PageHeaderComponent]
})
export class DinasReviewPage implements OnInit {
  activeTab: 'pending' | 'reviewed' | 'absen' = 'pending';
  pending: any[] = [];
  reviewed: any[] = [];
  absenRecords: any[] = [];
  isLoading = true;
  isLoadingAbsen = false;
  expandedSelfie: string | null = null;

  constructor(
    public dinasService: DinasLuarService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.dinasService.getPendingReview().subscribe({
      next: (data) => { this.pending = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
    this.dinasService.getMyReviews().subscribe({
      next: (data) => { this.reviewed = data; },
      error: () => {}
    });
  }

  setTab(tab: 'pending' | 'reviewed' | 'absen') {
    this.activeTab = tab;
    if (tab === 'absen' && this.absenRecords.length === 0) {
      this.loadAbsenRecords();
    }
  }

  loadAbsenRecords() {
    this.isLoadingAbsen = true;
    this.dinasService.getAbsenRecords().subscribe({
      next: (data) => { this.absenRecords = data; this.isLoadingAbsen = false; },
      error: () => { this.isLoadingAbsen = false; }
    });
  }

  viewSelfie(url: string) {
    this.expandedSelfie = this.expandedSelfie === url ? null : url;
  }

  async approve(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Setujui Dinas?',
      message: `Setujui pengajuan dinas "${item.location_name}" dari ${item.user?.name}?`,
      inputs: [{ name: 'note', type: 'text', placeholder: 'Catatan (opsional)' }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Setujui', handler: (data) => { this.doReview(item.id, 'approved', data.note || ''); } }
      ]
    });
    await alert.present();
  }

  async reject(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Tolak Dinas?',
      message: `Tolak pengajuan dinas "${item.location_name}" dari ${item.user?.name}?`,
      inputs: [{ name: 'note', type: 'text', placeholder: 'Alasan penolakan' }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Tolak', cssClass: 'alert-btn-danger', handler: (data) => { this.doReview(item.id, 'rejected', data.note || ''); } }
      ]
    });
    await alert.present();
  }

  doReview(id: number, status: 'approved' | 'rejected', note: string) {
    this.dinasService.review(id, status, note).subscribe({
      next: async () => {
        const msg = status === 'approved' ? 'Dinas disetujui.' : 'Dinas ditolak.';
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

  openDetail(item: any) {
    this.dinasService.currentDetail = item;
    this.router.navigate(['/dinas-luar/detail']);
  }

  statusLabel(s: string) { return this.dinasService.statusLabel(s); }
  statusColor(s: string) { return this.dinasService.statusColor(s); }
  fmtDt(iso: string)     { return this.dinasService.formatDt(iso); }
}
