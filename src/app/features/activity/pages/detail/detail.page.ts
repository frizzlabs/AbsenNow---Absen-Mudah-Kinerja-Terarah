import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../../../core/services/activity.service';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslatePipe, PageHeaderComponent]
})
export class DetailPage implements OnInit {
  activity: any = null;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private activityService: ActivityService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.activityService.getActivity(id).subscribe({
        next: (a) => {
          this.activity = a;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  get durationLabel(): string {
    const mins = this.activity?.duration_minutes || 0;
    return `${Math.floor(mins / 60)} jam ${(mins % 60).toString().padStart(2, '0')} mnt`;
  }

  get activityCode(): string {
    if (!this.activity) return '';
    return '#ACT-' + this.activity.id.toString().padStart(4, '0');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  toAmPm(timeStr: string): string {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  }

  goBack() {
    this.router.navigate(['/activity']);
  }

  editActivity() {
    this.router.navigate(['/activity/edit'], { queryParams: { id: this.activity?.id } });
  }
}
