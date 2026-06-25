import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ExpenseReceiptPreviewComponent } from '../../../../shared/components/expense-receipt-preview/expense-receipt-preview.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-revision',
  templateUrl: './revision.page.html',
  styleUrls: ['./revision.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ExpenseReceiptPreviewComponent, PageHeaderComponent, BottomNavComponent]
})
export class RevisionPage implements OnInit {
  merchantName: string = 'The Corner Bistro';
  expenseDate: string = 'Oct 24, 2026';
  amount: number = 45.00;
  category: string = 'Meals & Entertainment';
  notes: string = 'Client lunch with ABC Corp.';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/expense/detail']);
  }

  updateRequest() {
    this.router.navigate(['/expense/detail']);
  }
}
