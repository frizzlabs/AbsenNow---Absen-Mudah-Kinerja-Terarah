import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DinasLuarService } from '../../../../core/services/dinas-luar.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-dinas-submitted',
  templateUrl: './submitted.page.html',
  styleUrls: ['./submitted.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ButtonComponent, BottomNavComponent]
})
export class DinasSubmittedPage implements OnInit {
  type: 'ajukan' | 'absen' = 'ajukan';
  geofenceValid: boolean | null = null;

  constructor(
    public dinasService: DinasLuarService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.type = (this.route.snapshot.queryParamMap.get('type') as any) || 'ajukan';
    this.geofenceValid = this.dinasService.absenResult?.geofence_valid ?? null;
  }

  get title(): string {
    return this.type === 'absen' ? 'Absen Dinas Tercatat!' : 'Pengajuan Terkirim!';
  }

  get subtitle(): string {
    if (this.type === 'absen') {
      return this.geofenceValid
        ? 'Absen dinas Anda berhasil dicatat. Lokasi Anda berada dalam area dinas.'
        : 'Absen dinas Anda dicatat, namun lokasi Anda di luar area geofence yang ditentukan.';
    }
    return 'Pengajuan dinas luar Anda telah dikirim dan menunggu persetujuan atasan.';
  }

  goHistory() { this.router.navigate(['/dinas-luar/history']); }
  goHome()    { this.router.navigate(['/home']); }
}
