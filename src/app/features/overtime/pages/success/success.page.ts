import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { OvertimeService } from '../../../../core/services/overtime.service';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-overtime-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent]
})
export class SuccessPage implements OnInit {
  submitted: any = null;

  constructor(
    private router: Router,
    private overtimeService: OvertimeService
  ) {}

  ngOnInit() {
    const raw = localStorage.getItem('last_submitted_overtime');
    if (raw) {
      try {
        this.submitted = JSON.parse(raw);
      } catch (e) {
        this.submitted = null;
      }
    }
    // Clear the wizard draft now that submission is complete
    this.overtimeService.resetDraft();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
    if (hours === null || hours === undefined) return '';
    const val = parseFloat(hours.toString());
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    return `${h}h ${m}m`;
  }

  backToOvertime() {
    this.router.navigate(['/overtime'], { queryParams: { tab: 'pending' } });
  }

  goToApproval() {
    this.router.navigate(['/overtime'], { queryParams: { tab: 'pending' } });
  }
}
