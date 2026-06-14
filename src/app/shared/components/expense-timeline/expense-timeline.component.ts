import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineStep } from './expense-timeline.models';

@Component({
  selector: 'app-expense-timeline',
  templateUrl: './expense-timeline.component.html',
  styleUrls: ['./expense-timeline.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ExpenseTimelineComponent {
  @Input() steps: TimelineStep[] = [];
}
