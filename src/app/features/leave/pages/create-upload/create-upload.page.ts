import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';

@Component({
  selector: 'app-create-upload',
  templateUrl: './create-upload.page.html',
  styleUrls: ['./create-upload.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LeaveStepperComponent]
})
export class CreateUploadPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/leave/create/delegate']);
  }

  continue() {
    this.router.navigate(['/leave/create/summary']);
  }
}
