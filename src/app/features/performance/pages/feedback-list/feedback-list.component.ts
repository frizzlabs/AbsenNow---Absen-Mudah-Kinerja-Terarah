import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { FeedbackCardComponent } from '../../../../shared/components/feedback-card/feedback-card.component';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent, FeedbackCardComponent],
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.scss']
})
export class FeedbackListComponent {
  feedbacks = [
    {
      name: 'Sarah Miller',
      role: 'Sales Director',
      type: 'Manager',
      time: 'Today',
      text: 'Great job leading the Q1 retrospective. The team really appreciated your structured approach to...',
      status: 'Action Required',
      showAction: true,
      borderClass: 'border-orange',
      link: '/performance/feedback-detail'
    },
    {
      name: 'David Chen',
      role: 'Product Designer',
      type: 'Peer',
      time: 'Yesterday',
      text: 'Thanks for helping me debug the frontend component library. Your quick turnaround save...',
      status: 'Acknowledged',
      showAction: false,
      borderClass: 'border-green',
      link: '/performance/feedback-detail'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Marketing Lead',
      type: 'Peer',
      time: 'Mar 28',
      text: 'I loved the collaboration on the new brand guidelines. You were very open to feedback an...',
      status: 'Acknowledged',
      showAction: false,
      borderClass: 'border-green',
      link: '/performance/feedback-detail'
    },
    {
      name: 'James Wilson',
      role: 'VP of Engineering',
      type: 'Manager',
      time: 'Mar 25',
      text: 'Please review the architecture proposal again. I think we need to consider scalability more...',
      status: 'Acknowledged',
      showAction: true,
      borderClass: 'border-orange',
      link: '/performance/feedback-detail'
    },
    {
      name: 'Priya Patel',
      role: 'Data Scientist',
      type: 'Peer',
      time: 'Mar 20',
      text: 'Helpful insights during the data modeling workshop. Your questions helped clarify the...',
      status: 'Acknowledged',
      showAction: false,
      borderClass: 'border-green',
      link: '/performance/feedback-detail'
    }
  ];
}
