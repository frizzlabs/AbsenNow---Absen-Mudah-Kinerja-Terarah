import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-expense-receipt-preview',
  templateUrl: './expense-receipt-preview.component.html',
  styleUrls: ['./expense-receipt-preview.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ExpenseReceiptPreviewComponent {
  @Input() imageUrl: string = '';
  @Input() fileName: string = '';
  @Input() fileSize: string = '';
  @Input() showClose: boolean = false;
  @Input() showView: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onView = new EventEmitter<void>();
}
