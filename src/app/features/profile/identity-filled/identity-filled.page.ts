import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IdentityService } from '../../../core/services/identity.service';

@Component({
  selector: 'app-identity-filled',
  templateUrl: './identity-filled.page.html',
  styleUrls: ['./identity-filled.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, PageHeaderComponent, SectionCardComponent, ButtonComponent]
})
export class IdentityFilledPage {
  identity: any = null;
  isLoading = true;

  constructor(private identityService: IdentityService, private router: Router) {}

  ionViewWillEnter() {
    this.identityService.getIdentity().subscribe({
      next: (data) => {
        this.isLoading = false;
        if (!data) {
          this.router.navigateByUrl('/profile/identity/required', { replaceUrl: true });
          return;
        }
        this.identity = data;
      },
      error: () => { this.isLoading = false; }
    });
  }

  get typeLabel(): string {
    if (!this.identity) return '-';
    return this.identity.id_type === 'ktp' ? 'KTP (Kartu Tanda Penduduk)' : 'Paspor';
  }

  get expiryLabel(): string {
    if (!this.identity?.id_expiry) return 'Seumur hidup';
    try {
      return new Date(this.identity.id_expiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return this.identity.id_expiry; }
  }

  get updatedLabel(): string {
    if (!this.identity?.updated_at) return '-';
    try {
      return new Date(this.identity.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '-'; }
  }

  get statusColor(): string {
    switch (this.identity?.status) {
      case 'verified': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#f59e0b';
    }
  }

  get statusBg(): string {
    switch (this.identity?.status) {
      case 'verified': return '#d1fae5';
      case 'rejected': return '#fef2f2';
      default: return '#fef3c7';
    }
  }

  get statusLabel(): string {
    switch (this.identity?.status) {
      case 'verified': return 'Terverifikasi';
      case 'rejected': return 'Ditolak';
      default: return 'Menunggu Verifikasi';
    }
  }

  get statusIcon(): string {
    switch (this.identity?.status) {
      case 'verified': return 'checkmark-circle-outline';
      case 'rejected': return 'close-circle-outline';
      default: return 'time-outline';
    }
  }
}
