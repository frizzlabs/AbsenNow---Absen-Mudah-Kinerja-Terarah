import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveService, LeaveDraft } from '../../../../core/services/leave.service';

@Component({
  selector: 'app-create-success',
  templateUrl: './create-success.page.html',
  styleUrls: ['./create-success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class CreateSuccessPage implements OnInit {
  draft: LeaveDraft | null = null;
  totalDays: number = 0;

  constructor(
    private router: Router,
    private leaveService: LeaveService
  ) { }

  ngOnInit() {
    this.draft = this.leaveService.draftRequest;
    this.calculateTotalDays();
  }

  getLeaveTypeName(type?: string): string {
    if (!type) return 'Pengajuan Cuti';
    const mapping: { [key: string]: string } = {
      annual: 'Cuti Tahunan',
      sick: 'Cuti Sakit',
      unpaid: 'Cuti Diluar Tanggungan'
    };
    return mapping[type] || 'Pengajuan Cuti';
  }

  formatDateRange(): string {
    if (!this.draft?.start_date) return '-';
    try {
      const start = new Date(this.draft.start_date);
      const end = this.draft.end_date ? new Date(this.draft.end_date) : start;
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      const startText = start.toLocaleDateString('id-ID', options);
      const endText = end.toLocaleDateString('id-ID', options);
      return this.isSameDay(start, end) ? startText : `${startText} — ${endText}`;
    } catch (e) {
      return `${this.draft.start_date} - ${this.draft.end_date}`;
    }
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  calculateTotalDays() {
    if (!this.draft?.start_date) {
      this.totalDays = 0;
      return;
    }
    const start = new Date(this.draft.start_date);
    const end = this.draft.end_date ? new Date(this.draft.end_date) : start;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  backToActivity() {
    this.leaveService.resetDraft();
    this.router.navigate(['/leave/home']);
  }

  goToApproval() {
    this.leaveService.resetDraft();
    this.router.navigate(['/leave/home']); // fallback since approval screen isn't specified here yet
  }
}
