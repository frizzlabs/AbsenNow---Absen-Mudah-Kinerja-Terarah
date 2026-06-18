import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';
import { LeaveFileCardComponent } from '../../../../shared/components/leave-file-card/leave-file-card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-summary',
  templateUrl: './create-summary.page.html',
  styleUrls: ['./create-summary.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, LeaveStepperComponent, LeaveFileCardComponent, PageHeaderComponent]
})
export class CreateSummaryPage implements OnInit {
  isConfirmed: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/leave/create/upload']);
  }

  submit() {
    if (this.isConfirmed) {
      this.router.navigate(['/leave/create/success']);
    }
  }
}
