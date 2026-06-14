import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-timesheet-approval-status',
  templateUrl: './approval-status.page.html',
  styleUrls: ['./approval-status.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent]
})
export class ApprovalStatusPage {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/activity']);
  }

  editActivity() {
    this.router.navigate(['/activity/edit']); // Will route to edit
  }
}
