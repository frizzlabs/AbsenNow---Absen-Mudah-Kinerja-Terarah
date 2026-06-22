import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { PerformanceService } from '../../../../core/services/performance.service';

@Component({
  selector: 'app-feedback-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent],
  templateUrl: './feedback-detail.component.html',
  styleUrls: ['./feedback-detail.component.scss']
})
export class FeedbackDetailComponent implements OnInit {
  feedback: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private performanceService: PerformanceService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.performanceService.getFeedback(id).subscribe({
        next: (f) => {
          this.feedback = f;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false)
      });
    } else {
      this.isLoading = false;
    }
  }

  get typeLabel(): string {
    return this.feedback?.type === 'manager' ? 'Manager' : 'Peer';
  }
  get paragraphs(): string[] {
    return (this.feedback?.body || '').split('\n').map((p: string) => p.trim()).filter((p: string) => p.length);
  }
  get isPending(): boolean {
    return this.feedback?.status === 'pending';
  }
  get submittedLabel(): string {
    if (!this.feedback?.submitted_at) return '';
    const d = new Date(this.feedback.submitted_at);
    const datePart = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
    const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${datePart} ${timePart} WIB`;
  }

  async acknowledge() {
    if (!this.feedback || !this.isPending) return;

    const loading = await this.loadingCtrl.create({ message: 'Acknowledging...' });
    await loading.present();

    this.performanceService.acknowledgeFeedback(this.feedback.id).subscribe({
      next: (res) => {
        loading.dismiss();
        this.feedback = res.feedback;
      },
      error: async (err) => {
        loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: err.error?.message || 'Failed to acknowledge feedback.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
