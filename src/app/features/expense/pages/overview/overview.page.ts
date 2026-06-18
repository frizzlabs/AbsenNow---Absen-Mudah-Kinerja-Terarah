import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ExpenseStatCardComponent } from '../../../../shared/components/expense-stat-card/expense-stat-card.component';
import { ExpenseCardComponent } from '../../../../shared/components/expense-card/expense-card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ExpenseStatCardComponent, ExpenseCardComponent, PageHeaderComponent]
})
export class OverviewPage implements OnInit {
  currentRequests = [
    {
      title: 'Uber to Airport',
      category: 'Business Trip',
      date: 'Oct 24',
      amount: 45.00,
      status: 'Pending' as any,
      icon: 'car-outline',
      iconColor: 'primary' as any
    },
    {
      title: 'Flight to NYC',
      category: 'Business Trip',
      date: 'Oct 24',
      amount: 450.00,
      status: 'Paid' as any,
      icon: 'airplane-outline',
      iconColor: 'primary' as any
    },
    {
      title: 'Client Lunch',
      category: 'Marketing',
      date: 'Oct 22',
      amount: 4250.00,
      status: 'Paid' as any,
      icon: 'restaurant-outline',
      iconColor: 'warning' as any
    },
    {
      title: 'Client Dinner',
      category: 'Marketing',
      date: 'Oct 22',
      amount: 4250.00,
      status: 'Paid' as any,
      icon: 'restaurant-outline',
      iconColor: 'warning' as any
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToHistory() {
    this.router.navigate(['/expense/history']);
  }

  goToCreate() {
    this.router.navigate(['/expense/create/step-1']);
  }
}
