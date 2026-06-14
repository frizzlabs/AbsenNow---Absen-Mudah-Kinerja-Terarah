import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ExpenseReceiptPreviewComponent } from '../../../../shared/components/expense-receipt-preview/expense-receipt-preview.component';
import { ExpenseTimelineComponent } from '../../../../shared/components/expense-timeline/expense-timeline.component';
import { TimelineStep } from '../../../../shared/components/expense-timeline/expense-timeline.models';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, ExpenseReceiptPreviewComponent, ExpenseTimelineComponent]
})
export class DetailPage implements OnInit {
  timelineSteps: TimelineStep[] = [
    {
      title: 'Submitted',
      subtitle: 'Request created by <strong>Sarah Miller</strong>',
      time: 'Feb 28 09:00 PM',
      status: 'success'
    },
    {
      title: 'Finance Review',
      subtitle: 'Reviewed by <strong>Alex Johnson</strong>',
      time: 'Feb 28 09:20 PM',
      status: 'success'
    },
    {
      title: 'Revision Requested',
      subtitle: 'Request created by <strong>Alex Johnson</strong>',
      time: 'Feb 28 09:20 PM',
      status: 'success'
    },
    {
      title: 'Correction Needed',
      subtitle: 'Request created by <strong>Alex Johnson</strong>',
      time: 'Feb 28 09:20 PM',
      status: 'warning'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/expense/history']);
  }

  editExpense() {
    this.router.navigate(['/expense/revision']);
  }
}
