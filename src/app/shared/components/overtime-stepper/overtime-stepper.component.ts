import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

interface WizardStep {
  label: string;
  route: string;
}

@Component({
  selector: 'app-overtime-stepper',
  templateUrl: './overtime-stepper.component.html',
  styleUrls: ['./overtime-stepper.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OvertimeStepperComponent {
  @Input() currentStep: number = 1;

  steps: WizardStep[] = [
    { label: 'Detail', route: '/overtime/request/step1' },
    { label: 'Ringkasan', route: '/overtime/request/step2' },
  ];

  constructor(private router: Router) {}

  get progressPercentage(): number {
    return (this.currentStep / this.steps.length) * 100;
  }

  goToStep(index: number) {
    if (index + 1 < this.currentStep) {
      this.router.navigate([this.steps[index].route]);
    }
  }

  isCompleted(index: number): boolean {
    return index + 1 < this.currentStep;
  }

  isActive(index: number): boolean {
    return index + 1 === this.currentStep;
  }
}
