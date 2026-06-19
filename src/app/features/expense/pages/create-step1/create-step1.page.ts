import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ExpenseStepperComponent } from '../../../../shared/components/expense-stepper/expense-stepper.component';
import { ExpenseService } from '../../../../core/services/expense.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-step1',
  templateUrl: './create-step1.page.html',
  styleUrls: ['./create-step1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ExpenseStepperComponent, PageHeaderComponent]
})
export class CreateStep1Page implements OnInit {
  categories = [
    { id: 'travel', name: 'Travel & Transportation', icon: 'car-outline' },
    { id: 'meals', name: 'Meals & Entertainment', icon: 'restaurant-outline' },
    { id: 'office', name: 'Office Supplies', icon: 'business-outline' },
    { id: 'hotel', name: 'Accommodation / Hotel', icon: 'bed-outline' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal-outline' }
  ];
  
  selectedCategory: string = 'meals';

  constructor(
    private router: Router,
    private expenseService: ExpenseService
  ) { }

  ngOnInit() {
    this.selectedCategory = this.expenseService.draftRequest.category || 'meals';
  }

  selectCategory(id: string) {
    this.selectedCategory = id;
  }

  goBack() {
    this.router.navigate(['/expense/overview']);
  }

  next() {
    this.expenseService.draftRequest.category = this.selectedCategory;
    this.router.navigate(['/expense/create/step-2']);
  }
}
