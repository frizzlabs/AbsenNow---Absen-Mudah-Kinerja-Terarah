import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';

@Component({
  selector: 'app-create-dates',
  templateUrl: './create-dates.page.html',
  styleUrls: ['./create-dates.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LeaveStepperComponent]
})
export class CreateDatesPage implements OnInit {
  daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // Hardcoded for UI representation matching the PNG exactly
  calendarDays = [
    { date: 27, isCurrentMonth: false, isSelected: false, isRange: false },
    { date: 28, isCurrentMonth: false, isSelected: false, isRange: false },
    { date: 29, isCurrentMonth: false, isSelected: false, isRange: false },
    { date: 30, isCurrentMonth: false, isSelected: false, isRange: false },
    { date: 1, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 2, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 3, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 4, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 5, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 6, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 7, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 8, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 9, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 10, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 11, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 12, isCurrentMonth: true, isSelected: true, isRange: false },
    { date: 13, isCurrentMonth: true, isSelected: false, isRange: true },
    { date: 14, isCurrentMonth: true, isSelected: true, isRange: false },
    { date: 15, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 16, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 17, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 18, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 19, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 20, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 21, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 22, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 23, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 24, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 25, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 26, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 27, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 28, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 29, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 30, isCurrentMonth: true, isSelected: false, isRange: false },
    { date: 31, isCurrentMonth: true, isSelected: false, isRange: false }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/leave/create/type']);
  }

  continue() {
    this.router.navigate(['/leave/create/delegate']);
  }
}
