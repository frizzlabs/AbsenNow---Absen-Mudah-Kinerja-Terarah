import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permission-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ReviewPage {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/permission/request']);
  }

  submitRequest() {
    this.router.navigate(['/permission/success']);
  }
}
