import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  template: `
    <div class="custom-card" [ngClass]="{'has-padding': padding}">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CardComponent {
  @Input() padding: boolean = true;
}
