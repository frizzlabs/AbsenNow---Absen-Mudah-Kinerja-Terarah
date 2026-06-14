import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-leave-radio-card',
  templateUrl: './leave-radio-card.component.html',
  styleUrls: ['./leave-radio-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LeaveRadioCardComponent {
  @Input() iconName?: string;
  @Input() iconColorClass?: string;
  @Input() avatarUrl?: string;
  @Input() avatarStatusColor?: string; // e.g. 'success' for green online dot
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() selected: boolean = false;
  
  @Output() cardSelect = new EventEmitter<void>();

  onClick() {
    this.cardSelect.emit();
  }
}
