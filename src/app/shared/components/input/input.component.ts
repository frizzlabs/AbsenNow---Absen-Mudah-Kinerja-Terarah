import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-input',
  template: `
    <div class="input-group">
      <label class="text-body-small-medium" *ngIf="label">{{ label }}</label>
      <div class="input-wrapper">
        <ion-icon *ngIf="leftIcon" [name]="leftIcon" class="input-icon-left"></ion-icon>
        <input [type]="type" [placeholder]="placeholder" [value]="value" class="custom-input text-body-medium-regular" [ngClass]="{'has-left-icon': leftIcon, 'has-right-icon': rightIcon, 'pw-input': type === 'password'}" />
        <ion-icon *ngIf="rightIcon" [name]="rightIcon" class="input-icon-right"></ion-icon>
      </div>
    </div>
  `,
  styleUrls: ['./input.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class InputComponent {
  @Input() label?: string;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() leftIcon?: string;
  @Input() rightIcon?: string;
}
