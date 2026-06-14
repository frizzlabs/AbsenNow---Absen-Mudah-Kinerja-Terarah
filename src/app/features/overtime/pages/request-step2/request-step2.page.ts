import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overtime-request-step2',
  templateUrl: './request-step2.page.html',
  styleUrls: ['./request-step2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RequestStep2Page {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/overtime/request/step1']);
  }

  submitRequest() {
    this.router.navigate(['/overtime/request/success']);
  }
}
