import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { FilterSheetComponent } from '../../components/filter-sheet/filter-sheet.component';
import { SubmitTimesheetModalComponent } from '../../components/submit-timesheet-modal/submit-timesheet-modal.component';
import { SubmitSuccessModalComponent } from '../../components/submit-success-modal/submit-success-modal.component';

export interface Activity {
  title: string;
  durationHours: number;
  durationMinutes: number;
  project: string;
  projectColor: string;
  timeRange: string;
  date: Date;
}

@Component({
  selector: 'app-activity-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent, TranslatePipe]
})
export class ListPage {
  Math = Math;

  selectedView: 'daily' | 'weekly' | 'monthly' = 'daily';

  // Base data extracted from hardcoded HTML
  allActivities: Activity[] = [
    {
      title: 'Frontend Development',
      durationHours: 3,
      durationMinutes: 15,
      project: 'Karajo HRIS Internal Tools',
      projectColor: 'primary',
      timeRange: '1:00 PM - 4:15 PM',
      date: new Date() // Today
    },
    {
      title: 'Client Meeting',
      durationHours: 1,
      durationMinutes: 0,
      project: 'Project Alpha',
      projectColor: 'purple',
      timeRange: '9:00 AM - 10:00 AM',
      date: new Date() // Today
    }
  ];

  constructor(private router: Router, private modalCtrl: ModalController) {}

  setView(view: 'daily' | 'weekly' | 'monthly') {
    this.selectedView = view;
  }

  get filteredActivities(): Activity[] {
    const today = new Date();
    return this.allActivities.filter(act => {
      const actDate = act.date;
      if (this.selectedView === 'daily') {
        return actDate.toDateString() === today.toDateString();
      } else if (this.selectedView === 'weekly') {
        // Simple logic for within last 7 days
        const diffTime = Math.abs(today.getTime() - actDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else if (this.selectedView === 'monthly') {
        return actDate.getMonth() === today.getMonth() && actDate.getFullYear() === today.getFullYear();
      }
      return true;
    });
  }

  get totalDuration(): string {
    let totalMins = 0;
    this.filteredActivities.forEach(act => {
      totalMins += (act.durationHours * 60) + act.durationMinutes;
    });
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hours}h ${mins}m`;
  }

  get dateSubtitle(): string {
    if (this.selectedView === 'daily') return 'Today';
    if (this.selectedView === 'weekly') return 'This Week';
    if (this.selectedView === 'monthly') return 'This Month';
    return '';
  }

  get dateHeader(): string {
    const today = new Date();
    if (this.selectedView === 'daily') {
      return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (this.selectedView === 'weekly') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (this.selectedView === 'monthly') {
      return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return '';
  }

  get groupedActivities() {
    const groups: { dateStr: string; dateObj: Date; activities: Activity[]; totalMins: number }[] = [];
    this.filteredActivities.forEach(act => {
      const dStr = act.date.toDateString();
      let group = groups.find(g => g.dateStr === dStr);
      if (!group) {
        group = { dateStr: dStr, dateObj: act.date, activities: [], totalMins: 0 };
        groups.push(group);
      }
      group.activities.push(act);
      group.totalMins += (act.durationHours * 60) + act.durationMinutes;
    });
    return groups.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }

  get weeklyWeeks() {
    // For mockup purposes: static representation of weeks in Monthly view
    return [
      { label: 'Feb 22 - Feb 28', weekLabel: 'Week 4', status: 'Pending', statusClass: 'warning', hours: '40h 30m' },
      { label: 'Feb 15 - Feb 21', weekLabel: 'Week 3', status: 'Approved', statusClass: 'success', hours: '42h 00m' },
      { label: 'Feb 08 - Feb 14', weekLabel: 'Week 2', status: 'Approved', statusClass: 'success', hours: '40h 00m' },
      { label: 'Feb 01 - Feb 07', weekLabel: 'Week 1', status: 'Approved', statusClass: 'success', hours: '46h 00m' },
    ];
  }

  async openSubmitModal() {
    const modal = await this.modalCtrl.create({
      component: SubmitTimesheetModalComponent,
      breakpoints: [0, 0.85],
      initialBreakpoint: 0.85,
      cssClass: 'bottom-sheet-modal'
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.submitted) {
      // Show success modal
      const successModal = await this.modalCtrl.create({
        component: SubmitSuccessModalComponent,
        cssClass: 'full-screen-modal'
      });
      await successModal.present();
    }
  }

  formatDuration(hours: number, minutes: number): string {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  addActivity() {
    this.router.navigate(['/activity/add']);
  }

  viewDetail() {
    this.router.navigate(['/activity/detail']);
  }

  async openFilter() {
    const modal = await this.modalCtrl.create({
      component: FilterSheetComponent,
      breakpoints: [0, 0.75],
      initialBreakpoint: 0.75,
      cssClass: 'bottom-sheet-modal'
    });
    await modal.present();
  }
}
