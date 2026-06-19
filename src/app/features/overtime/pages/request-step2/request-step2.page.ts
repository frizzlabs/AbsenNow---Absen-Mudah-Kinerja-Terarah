import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OvertimeService } from '../../../../core/services/overtime.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-overtime-request-step2',
  templateUrl: './request-step2.page.html',
  styleUrls: ['./request-step2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, PageHeaderComponent]
})
export class RequestStep2Page implements OnInit {
  draft: any = null;
  isChecked = false;
  isSubmitting = false;

  constructor(
    private router: Router,
    private overtimeService: OvertimeService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.draft = this.overtimeService.draftRequest;
    if (!this.draft || !this.draft.title) {
      this.router.navigate(['/overtime/request/step1']);
    }
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

  get durationLabel(): string {
    if (!this.draft?.start_time || !this.draft?.end_time) return '';
    const [sh, sm] = this.draft.start_time.split(':').map(Number);
    const [eh, em] = this.draft.end_time.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins = 0;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  goBack() {
    this.router.navigate(['/overtime/request/step1']);
  }

  submitRequest() {
    if (!this.isChecked) {
      this.showToast('Please confirm these entries are accurate.');
      return;
    }

    this.isSubmitting = true;
    this.loadingController.create({ message: 'Submitting request...' }).then(loading => {
      loading.present();

      const payload = {
        title: this.draft.title,
        overtime_date: this.draft.overtime_date,
        start_time: this.draft.start_time,
        end_time: this.draft.end_time,
        reason: this.draft.reason,
        attachment: this.draft.attachment,
        attachment_name: this.draft.attachment_name
      };

      this.overtimeService.submitRequest(payload).subscribe({
        next: (res) => {
          loading.dismiss();
          this.isSubmitting = false;
          localStorage.setItem('last_submitted_overtime', JSON.stringify(res.overtime));
          this.router.navigate(['/overtime/request/success']);
        },
        error: async (err) => {
          loading.dismiss();
          this.isSubmitting = false;
          const errMsg = err.error?.message || 'Failed to submit overtime request.';
          const toast = await this.toastController.create({
            message: errMsg,
            duration: 3500,
            position: 'top',
            color: 'danger'
          });
          await toast.present();
        }
      });
    });
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }
}
