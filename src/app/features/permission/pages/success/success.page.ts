import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PermissionService } from '../../../../core/services/permission.service';

@Component({
  selector: 'app-permission-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SuccessPage implements OnInit {
  permission: any = null;

  constructor(
    private router: Router,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    const last = localStorage.getItem('last_submitted_permission');
    if (last) {
      this.permission = JSON.parse(last);
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  }

  formatDuration(hours: number | string): string {
    if (!hours) return '0 Hours';
    const val = parseFloat(hours.toString());
    if (val === 1) return '1 Hour';
    return `${val} Hours`;
  }

  backToPermission() {
    this.cleanup();
    this.router.navigate(['/permission']);
  }

  goToApproval() {
    this.cleanup();
    this.router.navigate(['/permission']);
  }

  private cleanup() {
    this.permissionService.resetDraft();
    localStorage.removeItem('last_submitted_permission');
  }
}
