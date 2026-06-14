import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ExpenseCardComponent } from '../../../../shared/components/expense-card/expense-card.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ExpenseCardComponent, CurrencyPipe]
})
export class HistoryPage implements OnInit {
  groups = [
    {
      month: 'FEBRUARY 2026',
      items: [
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
      ]
    },
    {
      month: 'JANUARY 2026',
      items: [
        {
          title: 'Uber to Airport',
          category: 'Business Trip',
          date: 'Oct 24',
          amount: 45.00,
          status: 'Pending' as any,
          icon: 'car-outline',
          iconColor: 'primary' as any
        }
      ]
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/expense/overview']);
  }

  goToCreate() {
    this.router.navigate(['/expense/create/step-1']);
  }
}
