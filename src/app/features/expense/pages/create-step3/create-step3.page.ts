import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ExpenseStepperComponent } from '../../../../shared/components/expense-stepper/expense-stepper.component';

@Component({
  selector: 'app-create-step3',
  templateUrl: './create-step3.page.html',
  styleUrls: ['./create-step3.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ExpenseStepperComponent]
})
export class CreateStep3Page implements OnInit {
  merchantName: string = 'The Corner Bistro';
  expenseDate: string = 'Oct 24, 2026';
  amount: number = 45.00;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/expense/create/step-2']);
  }

  next() {
    this.router.navigate(['/expense/create/summary']); // wait, next is review summary, which is step 4
  }
}
