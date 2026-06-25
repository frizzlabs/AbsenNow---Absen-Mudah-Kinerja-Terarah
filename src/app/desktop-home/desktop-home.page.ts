import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, Platform } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';

import { AuthService } from '../core/services/auth.service';
import { LanguageService } from '../shared/services/language.service';
import { DashboardService, RecentUpdate, InstagramPost } from '../core/services/dashboard.service';
import { RoleService } from '../core/services/role.service';
import { OrganizationService } from '../core/services/organization.service';
import { AttendanceStateService } from '../core/services/attendance-state.service';
import { CardComponent } from '../shared/components/card/card.component';
import { BottomNavComponent } from '../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-desktop-home',
  templateUrl: './desktop-home.page.html',
  styleUrls: ['./desktop-home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    TranslatePipe,
    CardComponent,
    BottomNavComponent
  ],
})
export class DesktopHomePage implements OnInit, OnDestroy {
  showShortcuts = false;
  currentTime = '08:32';
  currentTimeAmPm = 'AM';
  currentDate = 'Thursday, 12 Feb';
  greeting = 'Good Morning,';
  userName = 'User';
  userAvatar = '';

  todayAttendanceLabel = 'Belum Absen';
  clockInTime = '';
  clockOutTime = '';
  workDuration = '';
  attendanceCompleted = false;

  private clockInterval: any;

  recentUpdates: RecentUpdate[] = [];
  displayUpdates: any[] = [];
  isLoadingUpdates = false;
  newsFeed: InstagramPost[] = [];
  isLoadingNews = false;

  // Platform admin organization management variables
  organizations: any[] = [];
  isLoadingOrgs = false;
  showAddOrgModal = false;
  showEditOrgModal = false;

  // New org form
  newOrgName = '';
  newOrgCode = '';
  newOrgLogo = '';
  newOrgInstagramUsername = '';
  newOrgAdminName = '';
  newOrgAdminEmail = '';
  newOrgAdminPassword = '';

  // Edit org form
  editingOrg: any = null;
  editOrgName = '';
  editOrgLogo = '';
  editOrgInstagramUsername = '';
  editOrgIsActive = true;

  constructor(
    private platform: Platform,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private languageService: LanguageService,
    private translateService: TranslateService,
    private dashboardService: DashboardService,
    private roleService: RoleService,
    private orgService: OrganizationService,
    public attendanceState: AttendanceStateService,
    private cdr: ChangeDetectorRef
  ) {}

  get userRoleLabel(): string {
    const role = this.roleService.role;
    if (!role) return '';
    const labels: Record<string, string> = {
      superadmin: 'Super Admin',
      org_admin: 'Admin Instansi',
      manager: 'Manager',
      supervisor: 'Supervisor',
      staff: 'Staff',
    };
    return labels[role.name] || role.label || '';
  }

  get userRoleColor(): string {
    const role = this.roleService.role;
    if (!role) return '#64748b';
    const colors: Record<string, string> = {
      superadmin: '#f59e0b',
      org_admin: '#f59e0b',
      manager: '#8b5cf6',
      supervisor: '#3b82f6',
      staff: '#64748b',
    };
    return colors[role.name] || '#64748b';
  }

  get userRoleBg(): string {
    const hex = this.userRoleColor;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  }

  get isPlatformAdmin(): boolean {
    return this.roleService.role?.name === 'platform_superadmin';
  }

  get canManageUsers(): boolean {
    const name = this.roleService.role?.name;
    return name === 'superadmin' || name === 'org_admin' || this.roleService.can('users.manage');
  }
  get canManageOffice(): boolean {
    const name = this.roleService.role?.name;
    return name === 'superadmin' || name === 'org_admin' || this.roleService.can('office.manage');
  }
  get canApproveAttendance(): boolean {
    const name = this.roleService.role?.name;
    return name === 'superadmin' || name === 'org_admin' || this.roleService.can('attendance.approve');
  }

  get isAdminOnly(): boolean {
    return this.roleService.role?.name === 'superadmin' || this.roleService.role?.name === 'org_admin';
  }

  ngOnInit() {
    this.redirectIfMobile();
    this.updateClock();
    this.startClock();
  }

  private redirectIfMobile() {
    // Redirect ke /home jika ini platform mobile ATAU ukuran layar kecil (max 1023px)
    const isMobile = !this.platform.is('desktop') || window.innerWidth < 1024;
    if (isMobile) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  ionViewWillEnter() {
    this.roleService.loadMyPermissions().subscribe({
      next: () => {
        this.cdr.markForCheck();
        if (this.isPlatformAdmin) {
          this.loadOrganizations();
        }
      },
      error: (err) => console.error('Error loading permissions on desktop home entry:', err)
    });

    this.loadRecentUpdates();
    this.loadNewsFeed();
    this.loadAttendanceStats();
  }

  private async loadAttendanceStats() {
    await this.attendanceState.syncStatus();
    const att = this.attendanceState.todayAttendance;
    if (!att) {
      this.todayAttendanceLabel = 'Belum Absen';
      this.clockInTime = '';
      this.clockOutTime = '';
      this.workDuration = '';
    } else {
      if (this.attendanceState.hasCompletedToday) {
        this.todayAttendanceLabel = 'Selesai';
        this.attendanceCompleted = true;
      } else if (this.attendanceState.state === 'checked_in') {
        this.todayAttendanceLabel = 'Sudah Masuk';
        this.attendanceCompleted = false;
      } else {
        this.todayAttendanceLabel = 'Belum Absen';
        this.attendanceCompleted = false;
      }
      const validTime = (t: any) => typeof t === 'string' && t.includes(':');
      this.clockInTime = validTime(att.check_in) ? att.check_in.slice(0, 5) : '';
      this.clockOutTime = validTime(att.check_out) ? att.check_out.slice(0, 5) : '';
      if (validTime(att.check_in) && validTime(att.check_out)) {
        const [hIn, mIn] = att.check_in.split(':').map(Number);
        const [hOut, mOut] = att.check_out.split(':').map(Number);
        let diffMin = (hOut * 60 + mOut) - (hIn * 60 + mIn);
        if (diffMin < 0) diffMin += 24 * 60;
        this.workDuration = `${Math.floor(diffMin / 60)}j ${diffMin % 60}m`;
      } else if (validTime(att.check_in)) {
        const [hIn, mIn] = att.check_in.split(':').map(Number);
        const now = new Date();
        let diffMin = (now.getHours() * 60 + now.getMinutes()) - (hIn * 60 + mIn);
        if (diffMin < 0) diffMin += 24 * 60;
        this.workDuration = `${Math.floor(diffMin / 60)}j ${diffMin % 60}m`;
      } else {
        this.workDuration = '';
      }
    }
    this.cdr.detectChanges();
  }

  loadRecentUpdates() {
    this.isLoadingUpdates = true;
    this.dashboardService.getRecentUpdates(5).subscribe({
      next: (data) => {
        this.recentUpdates = data;
        this.displayUpdates = data.map(u => ({
          icon: u.icon,
          colorHex: this.updateColor(u.color),
          bg: this.updateBg(u.color),
          title: u.title,
          message: u.message,
          timeLabel: this.relativeTime(u.time),
          link: u.link
        }));
        this.isLoadingUpdates = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingUpdates = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateColor(color: string): string {
    const map: { [k: string]: string } = {
      green: '#22c55e', blue: '#3b82f6', orange: '#f97316', red: '#ef4444', purple: '#a855f7'
    };
    return map[color] || map['blue'];
  }

  updateBg(color: string): string {
    const hex = this.updateColor(color);
    return this.hexToRgba(hex, 0.12);
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  relativeTime(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins} mnt lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  openUpdate(link: string) {
    if (!link) return;
    const [path, query] = link.split('?');
    if (query) {
      const params: any = {};
      query.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        params[k] = v;
      });
      this.router.navigate([path], { queryParams: params });
    } else {
      this.router.navigate([path]);
    }
  }

  loadNewsFeed() {
    this.isLoadingNews = true;
    this.dashboardService.getNewsFeed().subscribe({
      next: (data) => {
        this.newsFeed = data;
        this.isLoadingNews = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load news feed:', err);
        this.isLoadingNews = false;
        this.cdr.detectChanges();
      }
    });
  }

  openNewsUrl(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  ionViewWillLeave() {
    this.stopClock();
  }

  ngOnDestroy() {
    this.stopClock();
  }

  startClock() {
    this.stopClock();
    this.updateClock();
    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  stopClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strHours = hours < 10 ? '0' + hours : hours;

    this.currentTime = `${strHours}:${strMinutes}`;
    this.currentTimeAmPm = '';

    const lang = this.languageService.getCurrentLanguage() === 'id' ? 'id-ID' : 'en-US';
    const weekday = now.toLocaleDateString(lang, { weekday: 'long' });
    const day = now.toLocaleDateString(lang, { day: 'numeric' });
    const month = now.toLocaleDateString(lang, { month: 'short' });
    this.currentDate = `${weekday}, ${day} ${month}`;

    const realHours = now.getHours();
    let greetingKey = 'home.goodMorning';
    if (realHours >= 12 && realHours < 17) {
      greetingKey = 'home.goodAfternoon';
    } else if (realHours >= 17 || realHours < 4) {
      greetingKey = 'home.goodEvening';
    }

    this.translateService.get(greetingKey).subscribe((res) => {
      this.greeting = res;
    });

    const user = this.authService.getUser();
    this.userName = user ? user.name : 'User';
    this.userAvatar = user?.avatar_url || '';
  }

  get viewState() {
    if (this.isPlatformAdmin) return 'platform_admin';
    if (this.isAdminOnly) return 'admin';
    return 'default';
  }

  toggleShortcuts() {
    this.showShortcuts = !this.showShortcuts;
  }

  loadOrganizations() {
    this.isLoadingOrgs = true;
    this.orgService.getOrganizations().subscribe({
      next: (data) => {
        this.organizations = data;
        this.isLoadingOrgs = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.organizations = [];
        this.isLoadingOrgs = false;
        this.cdr.detectChanges();
      }
    });
  }

  createOrg() {
    if (!this.newOrgName || !this.newOrgCode || !this.newOrgAdminName || !this.newOrgAdminEmail || !this.newOrgAdminPassword) {
      return;
    }
    const payload = {
      name: this.newOrgName,
      code: this.newOrgCode,
      logo_url: this.newOrgLogo || null,
      instagram_username: this.newOrgInstagramUsername || null,
      admin_name: this.newOrgAdminName,
      admin_email: this.newOrgAdminEmail,
      admin_password: this.newOrgAdminPassword,
    };
    this.orgService.createOrganization(payload).subscribe({
      next: () => {
        this.showAddOrgModal = false;
        this.loadOrganizations();
        // Reset form
        this.newOrgName = '';
        this.newOrgCode = '';
        this.newOrgLogo = '';
        this.newOrgInstagramUsername = '';
        this.newOrgAdminName = '';
        this.newOrgAdminEmail = '';
        this.newOrgAdminPassword = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to create organization', err);
      }
    });
  }

  openEditOrg(org: any) {
    this.editingOrg = org;
    this.editOrgName = org.name;
    this.editOrgLogo = org.logo_url || '';
    this.editOrgIsActive = org.is_active;
    this.editOrgInstagramUsername = org.settings?.instagram_username || '';
    this.showEditOrgModal = true;
  }

  updateOrg() {
    if (!this.editingOrg) return;
    const payload = {
      name: this.editOrgName,
      logo_url: this.editOrgLogo || null,
      is_active: this.editOrgIsActive,
      instagram_username: this.editOrgInstagramUsername || null,
    };
    this.orgService.updateOrganization(this.editingOrg.id, payload).subscribe({
      next: () => {
        this.showEditOrgModal = false;
        this.editingOrg = null;
        this.loadOrganizations();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update organization', err);
      }
    });
  }
}
