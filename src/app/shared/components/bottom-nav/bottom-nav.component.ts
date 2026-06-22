import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { RoleService } from '../../../core/services/role.service';

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

  constructor(private router: Router, public roleService: RoleService) {}

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
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private updateActiveTab(url: string) {
    if (url.includes('/home')) {
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
