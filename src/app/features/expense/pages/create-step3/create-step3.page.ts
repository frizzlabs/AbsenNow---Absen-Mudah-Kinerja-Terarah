import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ExpenseStepperComponent } from '../../../../shared/components/expense-stepper/expense-stepper.component';
import { ExpenseService } from '../../../../core/services/expense.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-step3',
  templateUrl: './create-step3.page.html',
  styleUrls: ['./create-step3.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, TranslatePipe, ExpenseStepperComponent, PageHeaderComponent]
})
export class CreateStep3Page implements OnInit {
  merchantName: string = '';
  expenseDate: string = '';
  amount: number | null = null;
  notes: string = '';

  constructor(
    private router: Router,
    public expenseService: ExpenseService
  ) { }

  ngOnInit() {
    this.merchantName = this.expenseService.draftRequest.merchant || '';
    this.expenseDate = this.expenseService.draftRequest.expense_date || '';
    this.amount = this.expenseService.draftRequest.amount;
    this.notes = this.expenseService.draftRequest.notes || '';
  }

  goBack() {
    this.router.navigate(['/expense/create/step-2']);
  }

  next() {
    this.expenseService.draftRequest.merchant = this.merchantName;
    this.expenseService.draftRequest.expense_date = this.expenseDate;
    this.expenseService.draftRequest.amount = this.amount;
    this.expenseService.draftRequest.notes = this.notes;
    
    this.router.navigate(['/expense/create/summary']);
  }
}
