import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overtime-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage {
  selectedSegment = 'all';

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/home']);
  }

  requestOvertime() {
    this.router.navigate(['/overtime/request/step1']);
  }
}
