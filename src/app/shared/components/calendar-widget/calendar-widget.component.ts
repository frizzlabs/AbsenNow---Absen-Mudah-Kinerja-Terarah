import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-calendar-widget',
  templateUrl: './calendar-widget.component.html',
  styleUrls: ['./calendar-widget.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CalendarWidgetComponent {
  constructor() {}
}
