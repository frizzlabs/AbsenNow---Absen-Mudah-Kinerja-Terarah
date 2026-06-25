import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { DinasLuarService } from '../../../../core/services/dinas-luar.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-absen-pick',
  templateUrl: './absen-pick.page.html',
  styleUrls: ['./absen-pick.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PageHeaderComponent, BottomNavComponent]
})
export class AbsenPickPage implements OnInit {
  items: any[] = [];
  isLoading = true;
  error = '';

  constructor(public dinasService: DinasLuarService, private router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.error = '';
    this.dinasService.getApprovedActive().subscribe({
      next: (data) => { this.items = data; this.isLoading = false; },
      error: () => { this.error = 'Gagal memuat daftar dinas aktif.'; this.isLoading = false; }
    });
  }

  pick(item: any) {
    this.dinasService.selectedDinas = item;
    this.router.navigate(['/dinas-luar/absen/form']);
  }

  fmtDt(iso: string) { return this.dinasService.formatDt(iso); }
}
