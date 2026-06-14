import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AddPage {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/activity']);
  }

  save() {
    this.router.navigate(['/activity']);
  }
}
