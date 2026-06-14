import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-numpad',
  template: `
    <div class="numpad" [ngClass]="variant">
      <div class="row" *ngFor="let row of rows">
        <button class="key" *ngFor="let key of row" (click)="onKeyPress(key)" [class.empty]="!key.value">
          <ng-container *ngIf="key.type === 'number'">
            <span class="num">{{ key.value }}</span>
            <span class="letters" *ngIf="key.letters">{{ key.letters }}</span>
          </ng-container>
          <ion-icon *ngIf="key.type === 'backspace'" name="backspace"></ion-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./numpad.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class NumpadComponent {
  @Input() variant: 'native' | 'transparent' = 'native';
  @Output() keyPress = new EventEmitter<string>();
  
  rows = [
    [ { value: '1', type: 'number' }, { value: '2', type: 'number', letters: 'A B C' }, { value: '3', type: 'number', letters: 'D E F' } ],
    [ { value: '4', type: 'number', letters: 'G H I' }, { value: '5', type: 'number', letters: 'J K L' }, { value: '6', type: 'number', letters: 'M N O' } ],
    [ { value: '7', type: 'number', letters: 'P Q R S' }, { value: '8', type: 'number', letters: 'T U V' }, { value: '9', type: 'number', letters: 'W X Y Z' } ],
    [ { value: '', type: 'empty' }, { value: '0', type: 'number' }, { value: 'backspace', type: 'backspace' } ]
  ];

  onKeyPress(key: any) {
    if (key.type !== 'empty') {
      this.keyPress.emit(key.value);
    }
  }
}
