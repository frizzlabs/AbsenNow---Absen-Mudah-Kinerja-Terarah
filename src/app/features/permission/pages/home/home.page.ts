import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-permission-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent]
})
export class HomePage {
  selectedSegment = 'all';

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/home']);
  }

  requestPermission() {
    this.router.navigate(['/permission/request']);
  }
}
