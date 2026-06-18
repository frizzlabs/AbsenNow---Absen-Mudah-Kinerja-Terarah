import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { DinasLuarService } from '../../../../core/services/dinas-luar.service';
import { RoleService } from '../../../../core/services/role.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-dinas-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PageHeaderComponent, ButtonComponent]
})
export class DinasHistoryPage implements OnInit {
  activeTab: 'mine' | 'reviewed' = 'mine';
  mine: any[] = [];
  reviewed: any[] = [];
  isLoading = true;
  canReview = false;

  constructor(
    public dinasService: DinasLuarService,
    private roleService: RoleService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.canReview = await this.roleService.can('attendance.approve');
    this.load();
  }

  load() {
    this.isLoading = true;
    this.dinasService.getAll().subscribe({
      next: (data) => { this.mine = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
    if (this.canReview) {
      this.dinasService.getMyReviews().subscribe({
        next: (data) => { this.reviewed = data; },
        error: () => {}
      });
    }
  }

  setTab(tab: 'mine' | 'reviewed') { this.activeTab = tab; }

  statusLabel(s: string) { return this.dinasService.statusLabel(s); }
  statusColor(s: string) { return this.dinasService.statusColor(s); }
  fmtDt(iso: string) { return this.dinasService.formatDt(iso); }

  openDetail(item: any) {
    this.dinasService.currentDetail = item;
    this.router.navigate(['/dinas-luar/detail']);
  }

  ajukan() { this.router.navigate(['/dinas-luar/ajukan']); }
  absen()  { this.router.navigate(['/dinas-luar/absen']); }
}
