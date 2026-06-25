import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CorrectionService } from '../../../../core/services/correction.service';
import { RoleService } from '../../../../core/services/role.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-correction-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent]
})
export class CorrectionHistoryPage {
  activeTab: 'pending' | 'reviewed' | 'mine' = 'pending';
  pendingItems: any[] = [];
  reviewedItems: any[] = [];
  myItems: any[] = [];
  isLoading = true;

  // ── "Pengajuan Saya": filter + pagination ──
  statusFilter: '' | 'pending' | 'approved' | 'rejected' = '';
  currentPage = 1;
  lastPage = 1;
  total = 0;

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
    this.loadMine(true);

    if (this.canReview) {
      this.correctionService.getPendingReview().subscribe({
        next: (data) => { this.pendingItems = data; }
      });
      this.correctionService.getMyReviews().subscribe({
        next: (data) => { this.reviewedItems = data; }
      });
    }
  }

  // Load page 1 (reset) atau halaman berikutnya (append)
  private loadMine(reset: boolean) {
    if (reset) {
      this.currentPage = 1;
      this.myItems = [];
      this.isLoading = true;
    }
    this.correctionService.getCorrections(this.currentPage, this.statusFilter).subscribe({
      next: (res) => {
        const items = res?.data ?? [];
        this.myItems = reset ? items : [...this.myItems, ...items];
        this.currentPage = res?.current_page ?? 1;
        this.lastPage = res?.last_page ?? 1;
        this.total = res?.total ?? this.myItems.length;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  get canLoadMore(): boolean { return this.currentPage < this.lastPage; }

  setStatusFilter(status: '' | 'pending' | 'approved' | 'rejected') {
    if (this.statusFilter === status) return;
    this.statusFilter = status;
    this.loadMine(true);
  }

  loadMore(ev: any) {
    if (!this.canLoadMore) { ev.target.complete(); return; }
    this.currentPage++;
    this.correctionService.getCorrections(this.currentPage, this.statusFilter).subscribe({
      next: (res) => {
        this.myItems = [...this.myItems, ...(res?.data ?? [])];
        this.lastPage = res?.last_page ?? this.lastPage;
        ev.target.complete();
      },
      error: () => { this.currentPage--; ev.target.complete(); }
    });
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

  goToDetail(id: number) {
    this.router.navigate(['/attendance/correction/detail'], { queryParams: { id } });
  }

  ajukanBaru() { this.router.navigate(['/attendance/correction/reason']); }
}
