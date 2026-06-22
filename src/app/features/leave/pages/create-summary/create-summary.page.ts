import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';
import { LeaveFileCardComponent } from '../../../../shared/components/leave-file-card/leave-file-card.component';
import { LeaveService, LeaveDraft } from '../../../../core/services/leave.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-summary',
  templateUrl: './create-summary.page.html',
  styleUrls: ['./create-summary.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, TranslatePipe, LeaveStepperComponent, LeaveFileCardComponent, PageHeaderComponent]
})
export class CreateSummaryPage implements OnInit {
  isConfirmed: boolean = false;
  draft: LeaveDraft | null = null;
  totalDays: number = 0;

  constructor(
    private router: Router,
    private leaveService: LeaveService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.draft = this.leaveService.draftRequest;
    this.calculateTotalDays();
  }

  getLeaveTypeName(type?: string): string {
    if (!type) return this.translate.instant('leave.leaveRequest');
    const mapping: { [key: string]: string } = {
      annual: this.translate.instant('leave.annualLeave'),
      sick: this.translate.instant('leave.sickLeave'),
      unpaid: this.translate.instant('leave.unpaidLeave')
    };
    return mapping[type] || this.translate.instant('leave.leaveRequest');
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
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

  goBack() {
    this.router.navigate(['/leave/create/upload']);
  }

  async submit() {
    if (!this.isConfirmed || !this.draft) {
      return;
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant('leave.submitting'),
      spinner: 'crescent'
    });
    await loading.present();

    const payload = {
      leave_type: this.draft.leave_type,
      start_date: this.draft.start_date,
      end_date: this.draft.end_date,
      delegate_user_id: this.draft.delegate_user_id,
      reason: this.draft.reason,
      attachment: this.draft.attachment,
      attachment_name: this.draft.attachment_name
    };

    this.leaveService.submitRequest(payload).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.router.navigate(['/leave/create/success']);
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Failed to submit leave request', err);
        
        let errorMessage = this.translate.instant('leave.submitError');
        if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.error?.errors) {
          const errors = Object.values(err.error.errors) as any[];
          errorMessage = errors.reduce((acc, val) => acc.concat(val), []).join('\n');
        }

        const alert = await this.alertController.create({
          header: this.translate.instant('leave.submitFailed'),
          message: errorMessage,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
