import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-input',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="input-group">
      <label class="text-body-small-medium" *ngIf="label">{{ label }}</label>
      <div class="input-wrapper">
        <ion-icon *ngIf="leftIcon" [name]="leftIcon" class="input-icon-left"></ion-icon>
        <input [type]="effectiveType" [placeholder]="placeholder" [value]="value" (input)="onInput($event)" [disabled]="disabled" class="custom-input text-body-medium-regular" [ngClass]="{'has-left-icon': leftIcon, 'has-right-icon': rightIcon, 'disabled': disabled}" />
        <button *ngIf="rightIcon && type === 'password'" type="button" class="icon-btn-right" (click)="togglePassword()" [disabled]="disabled">
          <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'" style="pointer-events:none"></ion-icon>
        </button>
        <ion-icon *ngIf="rightIcon && type !== 'password'" [name]="rightIcon" class="input-icon-right"></ion-icon>
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
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  showPassword = false;

  get effectiveType(): string {
    return this.type === 'password' && this.showPassword ? 'text' : this.type;
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  onInput(event: any) {
    this.value = event.target.value;
    this.valueChange.emit(this.value);
  }
}
