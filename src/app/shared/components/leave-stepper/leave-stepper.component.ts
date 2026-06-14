import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-stepper',
  templateUrl: './leave-stepper.component.html',
  styleUrls: ['./leave-stepper.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class LeaveStepperComponent {
  @Input() currentStep: number = 1;
  @Input() totalSteps: number = 6;
  @Input() rightText: string = 'Request Leave';

  get progressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
