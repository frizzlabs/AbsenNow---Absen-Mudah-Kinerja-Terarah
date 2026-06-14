import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overtime-request-step1',
  templateUrl: './request-step1.page.html',
  styleUrls: ['./request-step1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RequestStep1Page {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/overtime']);
  }

  continue() {
    this.router.navigate(['/overtime/request/step2']);
  }
}
