import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-expense-stat-card',
  templateUrl: './expense-stat-card.component.html',
  styleUrls: ['./expense-stat-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, CurrencyPipe]
})
export class ExpenseStatCardComponent {
  @Input() totalAmount: number = 0;
  @Input() growthPercentage: number = 0;
  @Input() pendingAmount: number = 0;
  @Input() approvedAmount: number = 0;
}
