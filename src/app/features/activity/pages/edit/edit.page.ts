import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../../../core/services/activity.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-activity-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, PageHeaderComponent]
})
export class EditPage implements OnInit {
  activityId: number | null = null;
  isLoading = true;

  title = '';
  project = '';
  category = 'development';
  activityDate = '';
  startTime = '09:00';
  endTime = '10:30';
  description = '';

  categories = [
    { value: 'development', label: 'Pengembangan', icon: 'code-slash-outline' },
    { value: 'meeting', label: 'Rapat', icon: 'people-outline' },
    { value: 'admin', label: 'Admin', icon: 'document-text-outline' },
    { value: 'design', label: 'Desain', icon: 'color-palette-outline' },
    { value: 'qa', label: 'QA', icon: 'search-outline' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.activityId = +id;
      this.loadActivity(this.activityId);
    } else {
      this.isLoading = false;
    }
  }

  loadActivity(id: number) {
    this.isLoading = true;
    this.activityService.getActivity(id).subscribe({
      next: (a) => {
        this.title = a.title;
        this.project = a.project || '';
        this.category = a.category || 'development';
        this.activityDate = a.activity_date;
        this.startTime = (a.start_time || '09:00').slice(0, 5);
        this.endTime = (a.end_time || '10:30').slice(0, 5);
        this.description = a.description || '';
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Gagal memuat aktivitas.', 'danger');
      }
    });
  }

  selectCategory(value: string) {
    this.category = value;
  }

  get durationLabel(): string {
    const [sh, sm] = this.startTime.split(':').map(Number);
    const [eh, em] = this.endTime.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins = 0;
    return `${Math.floor(mins / 60)} jam ${mins % 60} mnt`;
  }

  goBack() {
    this.router.navigate(['/activity']);
  }

  async update() {
    if (!this.activityId) {
      this.router.navigate(['/activity']);
      return;
    }
    if (!this.title.trim()) {
      this.showToast('Silakan masukkan judul aktivitas.');
      return;
    }
    if (this.endTime <= this.startTime) {
      this.showToast('Waktu selesai harus setelah waktu mulai.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Memperbarui log...' });
    await loading.present();

    this.activityService.updateActivity(this.activityId, {
      title: this.title,
      project: this.project || null,
      category: this.category,
      activity_date: this.activityDate,
      start_time: this.startTime,
      end_time: this.endTime,
      description: this.description || null
    }).subscribe({
      next: () => {
        loading.dismiss();
        this.router.navigate(['/activity']);
      },
      error: async (err) => {
        loading.dismiss();
        this.showToast(err.error?.message || 'Gagal memperbarui aktivitas.', 'danger');
      }
    });
  }

  async showToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2500, position: 'bottom', color });
    await toast.present();
  }
}
