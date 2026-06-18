import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';
import { LeaveRadioCardComponent } from '../../../../shared/components/leave-radio-card/leave-radio-card.component';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-delegate',
  templateUrl: './create-delegate.page.html',
  styleUrls: ['./create-delegate.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, LeaveStepperComponent, LeaveRadioCardComponent, PageHeaderComponent]
})
export class CreateDelegatePage implements OnInit {
  skipDelegate: boolean = false;
  selectedDelegate: string = 'hanna';

  delegates = [
    { id: 'hanna', name: 'Hanna Jenkins', role: 'Senior Project Manager', avatar: 'assets/images/avatar-hanna.png', status: 'success' },
    { id: 'michael', name: 'Michael Chen', role: 'UX Designer', avatar: 'assets/images/avatar-michael.png', status: 'success' },
    { id: 'david', name: 'David Miller', role: 'QA Lead', avatar: 'assets/images/avatar-david.png', status: 'medium' },
    { id: 'emma', name: 'Emma Wilson', role: 'Product Marketing', avatar: 'assets/images/avatar-emma.png', status: 'success' }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/leave/create/dates']);
  }

  selectDelegate(id: string) {
    if (!this.skipDelegate) {
      this.selectedDelegate = id;
    }
  }

  continue() {
    this.router.navigate(['/leave/create/upload']);
  }
}
