import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permission-request',
  templateUrl: './request.page.html',
  styleUrls: ['./request.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RequestPage {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/permission']);
  }

  continue() {
    this.router.navigate(['/permission/review']);
  }
}
