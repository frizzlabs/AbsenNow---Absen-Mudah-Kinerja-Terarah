import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { BottomNavComponent } from '../shared/components/bottom-nav/bottom-nav.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { CardComponent } from '../shared/components/card/card.component';
import { AttendanceStateService } from '../core/services/attendance-state.service';
import { CheckedInPage } from './pages/checked-in/checked-in.page';
import { CheckedOutPage } from './pages/checked-out/checked-out.page';
import { SwipeButtonComponent } from '../shared/components/swipe-button/swipe-button.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { LanguageService } from '../shared/services/language.service';
import { DashboardService, RecentUpdate } from '../core/services/dashboard.service';
import { RoleService } from '../core/services/role.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent, StatusBadgeComponent, CardComponent, RouterModule, CheckedInPage, CheckedOutPage, SwipeButtonComponent, TranslatePipe],
})
export class HomePage implements OnInit, OnDestroy {
  currentLocationName = 'Mendeteksi lokasi…';
  showShortcuts = false;

  currentTime = '08:32';
  currentTimeAmPm = 'AM';
  currentDate = 'Thursday, 12 Feb';
  greeting = 'Good Morning,';
  userName = 'Sarah';
  userAvatar = '';

  private clockInterval: any;

  recentUpdates: RecentUpdate[] = [];
  displayUpdates: any[] = [];
  isLoadingUpdates = false;

  constructor(
    public attendanceService: AttendanceStateService,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private languageService: LanguageService,
    private translateService: TranslateService,
    private dashboardService: DashboardService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  get userRoleLabel(): string {
    const role = this.roleService.role;
    if (!role) return '';
    const labels: Record<string, string> = {
      superadmin: 'Super Admin',
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

  get canManageUsers(): boolean { return this.roleService.can('users.manage'); }
  get canManageOffice(): boolean { return this.roleService.can('office.manage'); }
  get canApproveAttendance(): boolean { return this.roleService.can('attendance.approve'); }
  get canCreateAttendance(): boolean { return this.roleService.can('attendance.create'); }

  get isAdminOnly(): boolean {
    return this.roleService.role?.name === 'superadmin';
  }

  ngOnInit() {
    // Initial clock update
    this.updateClock();
  }

  ionViewWillEnter() {
    this.roleService.loadMyPermissions().subscribe(() => this.cdr.markForCheck());
    this.attendanceService.syncStatus();
    this.getCurrentLocation();
    this.startClock();
    this.loadRecentUpdates();
  }

  loadRecentUpdates() {
    this.isLoadingUpdates = true;
    this.dashboardService.getRecentUpdates(3).subscribe({
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
      },
      error: () => (this.isLoadingUpdates = false)
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
    if (mins < 60) return `${mins}m lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}h lalu`;
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

    // Time Formatting
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strHours = hours < 10 ? '0' + hours : hours;
    
    this.currentTime = `${strHours}:${strMinutes}`;
    this.currentTimeAmPm = ampm;

    // Date Formatting (e.g. "Thursday, 12 Feb")
    const lang = this.languageService.getCurrentLanguage() === 'id' ? 'id-ID' : 'en-US';
    const weekday = now.toLocaleDateString(lang, { weekday: 'long' });
    const day = now.toLocaleDateString(lang, { day: 'numeric' });
    const month = now.toLocaleDateString(lang, { month: 'short' });
    this.currentDate = `${weekday}, ${day} ${month}`;

    // Greeting
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

    // Username
    const user = this.authService.getUser();
    this.userName = user ? user.name : 'Sarah';
    this.userAvatar = user?.avatar_url || '';
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.reverseGeocode(lat, lng);
        },
        (error) => {
          console.warn('Home Geolocation failed, using default name', error);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }

  reverseGeocode(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    this.http.get<any>(url, {
      headers: { 'Accept-Language': 'id' }
    }).subscribe({
      next: (res) => {
        if (res && res.address) {
          const a = res.address;
          // Ambil area paling spesifik dulu, lalu tambah kota/kabupaten sebagai konteks
          const specific = a.quarter || a.neighbourhood || a.suburb || a.village || a.hamlet || a.city_district || a.district || '';
          const broad = a.city || a.town || a.municipality || a.county || '';
          if (specific && broad) {
            this.currentLocationName = `${specific}, ${broad}`;
          } else {
            this.currentLocationName = specific || broad || a.state || '';
          }
        }
      },
      error: (err) => {
        console.warn('Home reverse geocode failed', err);
      }
    });
  }

  get viewState() {
    if (this.isAdminOnly) return 'admin';
    if (this.attendanceService.state === 'checked_in') return 'checked_in';
    if (this.attendanceService.hasCompletedToday) return 'completed';
    return 'default';
  }

  toggleShortcuts() {
    this.showShortcuts = !this.showShortcuts;
  }

  onSwipeCheckIn() {
    this.router.navigate(['/attendance/validation']);
  }
}
