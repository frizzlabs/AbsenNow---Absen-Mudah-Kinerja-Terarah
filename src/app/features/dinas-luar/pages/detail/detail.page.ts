import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DinasLuarService } from '../../../../core/services/dinas-luar.service';
import { RoleService } from '../../../../core/services/role.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-dinas-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PageHeaderComponent, ButtonComponent]
})
export class DinasDetailPage implements OnInit {
  item: any = null;
  canReview = false;

  constructor(
    public dinasService: DinasLuarService,
    private roleService: RoleService,
    private location: Location,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.item = this.dinasService.currentDetail;
    if (!this.item) { this.location.back(); return; }
    this.canReview = await this.roleService.can('attendance.approve');
  }

  get isPending() { return this.item?.status === 'pending'; }
  get canApproveThis() { return this.canReview && this.isPending; }

  fmtDt(iso: string) { return this.dinasService.formatDt(iso); }
  statusLabel(s: string) { return this.dinasService.statusLabel(s); }
  statusColor(s: string) { return this.dinasService.statusColor(s); }

  async approve() {
    const alert = await this.alertCtrl.create({
      header: 'Setujui Dinas?',
      inputs: [{ name: 'note', type: 'text', placeholder: 'Catatan (opsional)' }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Setujui', handler: (d) => { this.doReview('approved', d.note || ''); } }
      ]
    });
    await alert.present();
  }

  async reject() {
    const alert = await this.alertCtrl.create({
      header: 'Tolak Dinas?',
      inputs: [{ name: 'note', type: 'text', placeholder: 'Alasan penolakan' }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Tolak', cssClass: 'alert-danger', handler: (d) => { this.doReview('rejected', d.note || ''); } }
      ]
    });
    await alert.present();
  }

  doReview(status: 'approved' | 'rejected', note: string) {
    this.dinasService.review(this.item.id, status, note).subscribe({
      next: async (res) => {
        const msg = status === 'approved' ? 'Dinas disetujui.' : 'Dinas ditolak.';
        const t = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'top', color: status === 'approved' ? 'success' : 'danger' });
        await t.present();
        this.item = res.dinas;
        this.dinasService.currentDetail = res.dinas;
      },
      error: async () => {
        const t = await this.toastCtrl.create({ message: 'Gagal memproses review.', duration: 2500, position: 'top', color: 'danger' });
        await t.present();
      }
    });
  }

  goBack() { this.location.back(); }
}
