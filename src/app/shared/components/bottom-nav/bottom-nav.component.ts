import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { RoleService } from '../../../core/services/role.service';
import { CorrectionService } from '../../../core/services/correction.service';
import { DinasLuarService } from '../../../core/services/dinas-luar.service';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, TranslatePipe]
})
export class BottomNavComponent implements OnInit, OnDestroy {
  @Input() activeTab: string = '';
  private routerSub!: Subscription;

  pendingCorrections = 0;
  pendingDinas = 0;
  pendingUpdates = 0;

  constructor(
    private router: Router,
    private platform: Platform,
    public roleService: RoleService,
    private correctionService: CorrectionService,
    private dinasLuarService: DinasLuarService,
    private dashboardService: DashboardService,
  ) {}

  get isDesktop(): boolean {
    return this.platform.is('desktop') && window.innerWidth >= 1024;
  }

  get homeRoute(): string {
    return this.isDesktop ? '/desktop-home' : '/home';
  }

  get approvalBadge(): number {
    return this.pendingCorrections + this.pendingDinas;
  }

  get org(): any { return this.roleService.organization; }

  get isAdmin(): boolean {
    const name = this.roleService.role?.name;
    return name === 'org_admin' || name === 'superadmin' || name === 'platform_superadmin';
  }

  ngOnInit() {
    this.updateActiveTab(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActiveTab(event.urlAfterRedirects);
    });
    this.loadBadges();
  }

  private loadBadges() {
    if (!this.isAdmin) return;
    this.correctionService.getPendingReview().subscribe({
      next: (data) => this.pendingCorrections = data?.length || 0,
      error: () => {},
    });
    this.dinasLuarService.getPendingReview().subscribe({
      next: (data) => this.pendingDinas = data?.length || 0,
      error: () => {},
    });
    this.dashboardService.getRecentUpdates(99).subscribe({
      next: (data) => this.pendingUpdates = data?.length || 0,
      error: () => {},
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private updateActiveTab(url: string) {
    if (url.includes('/home') || url.includes('/desktop-home')) {
      this.activeTab = 'home';
    } else if (url.includes('/activity') || url.includes('/timesheet') || url.includes('/admin/corrections') || url.includes('/dinas-luar/review')) {
      this.activeTab = 'activity';
    } else if (url.includes('/expense') || url.includes('/payslip') || url.includes('/attendance/team-dashboard')) {
      this.activeTab = 'finance';
    } else if (url.includes('/notification')) {
      this.activeTab = 'notification';
    } else {
      // If it's profile or AI chat or something else not on the bottom nav,
      // no tab will be lit up blue, keeping the UI clean.
      this.activeTab = '';
    }
  }
}
