import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-title',
  template: `
    <div class="text-center auth-text">
      <h2 class="text-h4">{{ title }}</h2>
      <p class="text-body-medium-regular text-medium">
        <ng-content></ng-content>
      </p>
    </div>
  `,
  styleUrls: ['./auth-title.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AuthTitleComponent {
  @Input() title: string = '';
}
