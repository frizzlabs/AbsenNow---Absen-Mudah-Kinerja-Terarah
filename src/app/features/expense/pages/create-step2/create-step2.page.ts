import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ExpenseStepperComponent } from '../../../../shared/components/expense-stepper/expense-stepper.component';
import { ExpenseReceiptPreviewComponent } from '../../../../shared/components/expense-receipt-preview/expense-receipt-preview.component';

@Component({
  selector: 'app-create-step2',
  templateUrl: './create-step2.page.html',
  styleUrls: ['./create-step2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, ExpenseStepperComponent, ExpenseReceiptPreviewComponent]
})
export class CreateStep2Page implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/expense/create/step-1']);
  }

  next() {
    this.router.navigate(['/expense/create/step-3']);
  }
}
