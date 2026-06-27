import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-button',
  template: `
    <button [class]="'btn-' + variant + ' text-body-medium-' + fontWeight" [disabled]="disabled" (click)="onClick.emit()">
      <ion-icon *ngIf="icon && iconPosition === 'left'" [name]="icon" class="btn-icon"></ion-icon>
      <ng-content></ng-content>
      <ion-icon *ngIf="icon && iconPosition === 'right'" [name]="icon" class="btn-icon"></ion-icon>
    </button>
  `,
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'outline' = 'primary';
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() fontWeight: 'semibold' | 'medium' | 'regular' = 'semibold';
  @Input() disabled: boolean = false;
  @Input() styleClass: string = '';
  @Output() onClick = new EventEmitter<void>();

  @HostBinding('class') get hostClasses() {
    return this.styleClass;
  }
}
