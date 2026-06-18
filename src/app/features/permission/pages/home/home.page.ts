import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { PermissionService } from '../../../../core/services/permission.service';

@Component({
  selector: 'app-permission-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class HomePage implements OnInit {
  selectedSegment = 'all';
  requestsList: any[] = [];
  groupedPermissions: { title: string; items: any[] }[] = [];
  isLoading = true;

  totalHours = 0;
  approvedCount = 0;

  constructor(
    private router: Router,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.isLoading = true;
    this.permissionService.getRequests().subscribe({
      next: (data) => {
        this.requestsList = data;
        this.calculateStats();
        this.groupPermissions(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load permissions list', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    // Approved count
    this.approvedCount = this.requestsList.filter(
      p => p.status.toLowerCase() === 'approved'
    ).length;

    // Total hours sum
    this.totalHours = this.requestsList
      .filter(p => p.status.toLowerCase() === 'approved')
      .reduce((acc, p) => acc + parseFloat(p.duration_hours.toString()), 0);
  }

  groupPermissions(list: any[]) {
    const groups: { [key: string]: any[] } = {};
    const now = new Date();
    const currentMonthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    list.forEach(item => {
      try {
        const d = new Date(item.permission_date);
        const itemMonthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        let key = itemMonthYear;
        if (itemMonthYear === currentMonthYear) {
          key = 'This Month';
        }

        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
      } catch (e) {
        const key = 'Other';
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
      }
    });

    this.groupedPermissions = Object.keys(groups).map(key => ({
      title: key,
      items: groups[key]
    }));
  }

  get filteredGroups() {
    if (this.selectedSegment === 'all') {
      return this.groupedPermissions;
    }
    return this.groupedPermissions.map(group => {
      return {
        title: group.title,
        items: group.items.filter(item => item.status.toLowerCase() === this.selectedSegment)
      };
    }).filter(group => group.items.length > 0);
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  formatDuration(hours: number | string): string {
    const val = parseFloat(hours.toString());
    if (val === 1) return '1 Hour';
    return `${val} Hours`;
  }

  formatCategory(cat: string): string {
    const mapping: { [key: string]: string } = {
      personal: 'Personal Permission',
      family: 'Family Emergency',
      emergency: 'House Emergency',
      other: 'Other'
    };
    return mapping[cat] || cat;
  }

  formatStatus(status: string): string {
    if (!status) return 'Pending';
    const lower = status.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  requestPermission() {
    this.permissionService.resetDraft();
    this.router.navigate(['/permission/request']);
  }
}
