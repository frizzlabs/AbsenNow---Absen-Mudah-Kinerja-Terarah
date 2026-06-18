import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-permission-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent]
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
