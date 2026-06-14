import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timesheet-revision',
  templateUrl: './revision.page.html',
  styleUrls: ['./revision.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RevisionPage {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/timesheet/approval-status']);
  }

  resubmit() {
    // Usually submit the resubmission, here we just go back to success or approval status
    this.router.navigate(['/timesheet/success']);
  }
}
