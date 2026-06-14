import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ExpenseStepperComponent } from '../../../../shared/components/expense-stepper/expense-stepper.component';
import { ExpenseReceiptPreviewComponent } from '../../../../shared/components/expense-receipt-preview/expense-receipt-preview.component';

@Component({
  selector: 'app-create-summary',
  templateUrl: './create-summary.page.html',
  styleUrls: ['./create-summary.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, ExpenseStepperComponent, ExpenseReceiptPreviewComponent, CurrencyPipe]
})
export class CreateSummaryPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/expense/create/step-3']);
  }

  submit() {
    this.router.navigate(['/expense/create/success']);
  }
}
