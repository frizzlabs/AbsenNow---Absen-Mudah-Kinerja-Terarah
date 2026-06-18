import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';
import { LeaveRadioCardComponent } from '../../../../shared/components/leave-radio-card/leave-radio-card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-type',
  templateUrl: './create-type.page.html',
  styleUrls: ['./create-type.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LeaveStepperComponent, LeaveRadioCardComponent, PageHeaderComponent]
})
export class CreateTypePage implements OnInit {
  selectedType: string = 'annual';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/leave/home']);
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  continue() {
    this.router.navigate(['/leave/create/dates']);
  }
}
