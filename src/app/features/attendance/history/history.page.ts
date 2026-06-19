import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AttendanceService } from '../../../core/services/attendance.service';
import { environment } from '../../../../environments/environment';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CardComponent, StatusBadgeComponent, PageHeaderComponent]
})
export class HistoryPage implements OnInit {
  historyLogs: any[] = [];
  isLoading = true;

  pivotDate = new Date();
  selectedDate = new Date();
  weekDays: any[] = [];
  monthYearLabel = '';
  weekLabel = '';

  constructor(
    private attendanceService: AttendanceService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.generateWeekDays(this.pivotDate);
    this.loadHistory();
  }

  generateWeekDays(pivotDate: Date) {
    const startOfWeek = new Date(pivotDate);
    let dayIndex = startOfWeek.getDay();
    // Adjust so 0 is Mon, 1 is Tue, ..., 6 is Sun
    let diff = startOfWeek.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        date: d,
        dayName: dayNames[i],
        dayNum: d.getDate(),
        isDisabled: d.getTime() > new Date().setHours(23, 59, 59, 999) // disable future dates
      });
    }
    this.weekDays = days;
    this.updateMonthYearLabel(startOfWeek);
  }

  updateMonthYearLabel(startOfWeek: Date) {
    const midWeek = new Date(startOfWeek);
    midWeek.setDate(startOfWeek.getDate() + 3); // Thursday as middle day of the week
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    const lang = localStorage.getItem('karajo_lang') === 'id' ? 'id-ID' : 'en-US';
    this.monthYearLabel = midWeek.toLocaleDateString(lang, options);

    // Calculate Week of the Month
    const day = midWeek.getDate();
    const weekNum = Math.ceil(day / 7);
    this.weekLabel = `Week ${weekNum}`;
  }

  prevWeek() {
    const newPivot = new Date(this.pivotDate);
    newPivot.setDate(this.pivotDate.getDate() - 7);
    this.pivotDate = newPivot;
    this.generateWeekDays(this.pivotDate);
  }

  nextWeek() {
    const newPivot = new Date(this.pivotDate);
    newPivot.setDate(this.pivotDate.getDate() + 7);
    
    // Do not allow navigating to a week that is entirely in the future
    const startOfNextWeek = new Date(newPivot);
    let dayIndex = startOfNextWeek.getDay();
    let diff = startOfNextWeek.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1);
    startOfNextWeek.setDate(diff);
    startOfNextWeek.setHours(0, 0, 0, 0);
    
    if (startOfNextWeek.getTime() > new Date().getTime()) {
      return; // block future weeks
    }

    this.pivotDate = newPivot;
    this.generateWeekDays(this.pivotDate);
  }

  selectDay(day: any) {
    if (day.isDisabled) return;
    this.selectedDate = day.date;
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getFilteredLogs(): any[] {
    if (!this.selectedDate) return [];
    const selectedStr = this.formatDateString(this.selectedDate);
    return this.historyLogs.filter(log => log.date === selectedStr);
  }

  getImageUrl(path: string | null): string | null {
    if (!path) return null;
    const base = environment.apiUrl.replace('/api', '');
    return `${base}/${path}`;
  }

  loadHistory() {
    this.isLoading = true;
    this.attendanceService.getHistory().subscribe({
      next: (data) => {
        this.historyLogs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  calculateDuration(checkIn: string, checkOut: string | null): string {
    if (!checkOut) return '-';
    try {
      const [hIn, mIn] = checkIn.split(':').map(Number);
      const [hOut, mOut] = checkOut.split(':').map(Number);
      
      let diffMinutes = (hOut * 60 + mOut) - (hIn * 60 + mIn);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    } catch (e) {
      return '-';
    }
  }

  formatTime12(timeStr: string | null): string {
    if (!timeStr) return '-';
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  }
}
