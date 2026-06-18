import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-success',
  templateUrl: './create-success.page.html',
  styleUrls: ['./create-success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class CreateSuccessPage implements OnInit {
  expenseId: string = '';
  amount: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.expenseId = params['id'] || '';
      this.amount = parseFloat(params['amount'] || '0');
    });
  }

  trackRequest() {
    if (this.expenseId) {
      this.router.navigate(['/expense/detail'], { queryParams: { id: this.expenseId } });
    } else {
      this.router.navigate(['/expense/overview']);
    }
  }

  backToOverview() {
    this.router.navigate(['/expense/overview']);
  }
}
  