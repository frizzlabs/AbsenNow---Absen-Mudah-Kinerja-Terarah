import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';
import { LeaveService } from '../../../../core/services/leave.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isRange: boolean;
  fullDate: Date;
}

@Component({
  selector: 'app-create-dates',
  templateUrl: './create-dates.page.html',
  styleUrls: ['./create-dates.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LeaveStepperComponent, PageHeaderComponent]
})
export class CreateDatesPage implements OnInit {
  daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  currentDate = new Date();
  displayYear = this.currentDate.getFullYear();
  displayMonth = this.currentDate.getMonth(); // 0-indexed

  startDate: Date | null = null;
  endDate: Date | null = null;

  calendarDays: CalendarDay[] = [];
  balances: any[] = [];
  selectedLeaveType: string = 'annual';

  constructor(
    private router: Router,
    private leaveService: LeaveService
  ) { }

  ngOnInit() {
    this.selectedLeaveType = this.leaveService.draftRequest.leave_type || 'annual';
    
    // Load existing draft dates if set
    if (this.leaveService.draftRequest.start_date) {
      this.startDate = new Date(this.leaveService.draftRequest.start_date);
      this.displayMonth = this.startDate.getMonth();
      this.displayYear = this.startDate.getFullYear();
    }
    if (this.leaveService.draftRequest.end_date) {
      this.endDate = new Date(this.leaveService.draftRequest.end_date);
    }

    this.loadBalances();
    this.generateCalendar();
  }

  loadBalances() {
    this.leaveService.getBalances().subscribe({
      next: (balances) => {
        this.balances = balances;
      },
      error: (err) => console.error('Failed to load balances', err)
    });
  }

  getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  }

  generateCalendar() {
    const days: CalendarDay[] = [];
    
    // First day of current display month
    const firstDay = new Date(this.displayYear, this.displayMonth, 1);
    // Day of the week for first day (0 = Sun, 1 = Mon, ...)
    const startDayOfWeek = firstDay.getDay();

    // Days in current display month
    const daysInMonth = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();

    // Days in previous month
    const prevMonth = this.displayMonth === 0 ? 11 : this.displayMonth - 1;
    const prevYear = this.displayMonth === 0 ? this.displayYear - 1 : this.displayYear;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    // Add prefix days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const fullDate = new Date(prevYear, prevMonth, d);
      days.push({
        date: d,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        isSelected: this.isDateSelected(fullDate),
        isRange: this.isDateInRange(fullDate),
        fullDate
      });
    }

    // Add days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const fullDate = new Date(this.displayYear, this.displayMonth, d);
      days.push({
        date: d,
        month: this.displayMonth,
        year: this.displayYear,
        isCurrentMonth: true,
        isSelected: this.isDateSelected(fullDate),
        isRange: this.isDateInRange(fullDate),
        fullDate
      });
    }

    // Add suffix days from next month to complete the grid
    const totalCells = days.length <= 35 ? 35 : 42;
    const nextMonth = this.displayMonth === 11 ? 0 : this.displayMonth + 1;
    const nextYear = this.displayMonth === 11 ? this.displayYear + 1 : this.displayYear;
    let nextDate = 1;
    while (days.length < totalCells) {
      const fullDate = new Date(nextYear, nextMonth, nextDate);
      days.push({
        date: nextDate,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isSelected: this.isDateSelected(fullDate),
        isRange: this.isDateInRange(fullDate),
        fullDate
      });
      nextDate++;
    }

    this.calendarDays = days;
  }

  isDateSelected(d: Date): boolean {
    if (this.startDate && this.isSameDay(d, this.startDate)) return true;
    if (this.endDate && this.isSameDay(d, this.endDate)) return true;
    return false;
  }

  isDateInRange(d: Date): boolean {
    if (!this.startDate || !this.endDate) return false;
    const time = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const startTime = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate()).getTime();
    const endTime = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate()).getTime();
    return time > startTime && time < endTime;
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  prevMonth() {
    if (this.displayMonth === 0) {
      this.displayMonth = 11;
      this.displayYear--;
    } else {
      this.displayMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.displayMonth === 11) {
      this.displayMonth = 0;
      this.displayYear++;
    } else {
      this.displayMonth++;
    }
    this.generateCalendar();
  }

  selectDay(d: CalendarDay) {
    const clickedDate = d.fullDate;
    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = clickedDate;
      this.endDate = null;
    } else {
      if (clickedDate < this.startDate) {
        this.startDate = clickedDate;
      } else {
        this.endDate = clickedDate;
      }
    }
    this.updateCalendarSelections();
  }

  updateCalendarSelections() {
    this.calendarDays.forEach(day => {
      day.isSelected = this.isDateSelected(day.fullDate);
      day.isRange = this.isDateInRange(day.fullDate);
    });
  }

  getSelectedRangeText(): string {
    if (!this.startDate) return 'Select start date';
    
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const startText = this.startDate.toLocaleDateString('en-US', options);
    
    if (!this.endDate) return `${startText} - Select end date`;
    
    const endText = this.endDate.toLocaleDateString('en-US', options);
    return `${startText} â€” ${endText}`;
  }

  getTotalRequestedDays(): number {
    if (!this.startDate) return 0;
    if (!this.endDate) return 1;
    
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  getLeaveBalanceText(after: boolean = false): string {
    const bal = this.balances.find(b => b.leave_type === this.selectedLeaveType);
    if (!bal) {
      if (this.selectedLeaveType === 'unpaid') return 'Unlimited';
      const initial = this.selectedLeaveType === 'annual' ? 12 : 5;
      if (after) {
        return `${Math.max(0, initial - this.getTotalRequestedDays())} Days`;
      }
      return `${initial} Days`;
    }

    const remaining = bal.allocated - bal.used;
    if (this.selectedLeaveType === 'unpaid') return 'Unlimited';

    if (after) {
      const remainingAfter = Math.max(0, remaining - this.getTotalRequestedDays());
      return `${remainingAfter} Day${remainingAfter !== 1 ? 's' : ''}`;
    }
    return `${remaining} Day${remaining !== 1 ? 's' : ''}`;
  }

  goBack() {
    this.router.navigate(['/leave/create/type']);
  }

  continue() {
    if (!this.startDate) {
      return;
    }
    
    const formatYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    this.leaveService.draftRequest.start_date = formatYMD(this.startDate);
    this.leaveService.draftRequest.end_date = this.endDate ? formatYMD(this.endDate) : formatYMD(this.startDate);
    
    this.router.navigate(['/leave/create/delegate']);
  }
}
