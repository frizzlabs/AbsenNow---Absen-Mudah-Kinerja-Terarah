import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class EditPage {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/activity']); // Or wherever appropriate
  }

  update() {
    this.router.navigate(['/activity']);
  }
}
