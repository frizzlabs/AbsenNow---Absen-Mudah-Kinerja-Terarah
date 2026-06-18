import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivitySummary } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-submit-timesheet-modal',
  templateUrl: './submit-timesheet-modal.component.html',
  styleUrls: ['./submit-timesheet-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class SubmitTimesheetModalComponent {
  @Input() summary: ActivitySummary | null = null;
  @Input() dateRange = '';
  @Input() breakdown: { title: string; label: string }[] = [];

  isConfirmed = false;

  constructor(private modalCtrl: ModalController) {}

  get totalHoursLabel(): string {
    return ((this.summary?.total_minutes || 0) / 60).toFixed(1) + 'h';
  }
  get activitiesCount(): number {
    return this.summary?.activities_count || 0;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  submit() {
    if (this.isConfirmed) {
      this.modalCtrl.dismiss({ submitted: true });
    }
  }
}
