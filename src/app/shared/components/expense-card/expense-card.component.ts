import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-expense-card',
  templateUrl: './expense-card.component.html',
  styleUrls: ['./expense-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, CurrencyPipe]
})
export class ExpenseCardComponent {
  @Input() title: string = '';
  @Input() category: string = '';
  @Input() date: string = '';
  @Input() amount: number = 0;
  @Input() status: 'Pending' | 'Paid' | 'Approved' | 'Rejected' | 'Draft' | 'Submitted' | 'Processed' = 'Pending';
  @Input() icon: string = 'car-outline';
  @Input() iconColor: 'primary' | 'warning' | 'danger' | 'success' | 'medium' = 'primary';
}
