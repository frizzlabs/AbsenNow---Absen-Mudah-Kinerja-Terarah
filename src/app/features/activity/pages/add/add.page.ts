import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActivityService } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-activity-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AddPage {
  title = '';
  project = '';
  category = 'development';
  activityDate = new Date().toISOString().slice(0, 10);
  startTime = '09:00';
  endTime = '10:30';
  description = '';

  categories = [
    { value: 'development', label: 'Development', icon: 'code-slash-outline' },
    { value: 'meeting', label: 'Meeting', icon: 'people-outline' },
    { value: 'admin', label: 'Admin', icon: 'document-text-outline' },
    { value: 'design', label: 'Design', icon: 'color-palette-outline' },
    { value: 'qa', label: 'QA', icon: 'search-outline' }
  ];

  constructor(
    private router: Router,
    private activityService: ActivityService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  selectCategory(value: string) {
    this.category = value;
  }

  get durationLabel(): string {
    const [sh, sm] = this.startTime.split(':').map(Number);
    const [eh, em] = this.endTime.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins = 0;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  goBack() {
    this.router.navigate(['/activity']);
  }

  async save() {
    if (!this.title.trim()) {
      this.showToast('Please enter an activity title.');
      return;
    }
    if (this.endTime <= this.startTime) {
      this.showToast('End time must be after start time.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Saving log...' });
    await loading.present();

    this.activityService.createActivity({
      title: this.title,
      project: this.project || null,
      project_color: 'primary',
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
        const msg = err.error?.message || 'Failed to save activity.';
        this.showToast(msg, 'danger');
      }
    });
  }

  async showToast(message: string, color: string = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2500, position: 'bottom', color });
    await toast.present();
  }
}
