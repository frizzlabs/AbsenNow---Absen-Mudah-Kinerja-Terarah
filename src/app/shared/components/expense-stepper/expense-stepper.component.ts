import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-stepper',
  templateUrl: './expense-stepper.component.html',
  styleUrls: ['./expense-stepper.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ExpenseStepperComponent {
  @Input() currentStep: number = 1;
  @Input() totalSteps: number = 5;
  @Input() title: string = 'Expense Request';
  
  get progressPercent(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
