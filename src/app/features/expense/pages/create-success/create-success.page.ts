import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-create-success',
  templateUrl: './create-success.page.html',
  styleUrls: ['./create-success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class CreateSuccessPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  trackRequest() {
    this.router.navigate(['/expense/detail']);
  }

  backToOverview() {
    this.router.navigate(['/expense/overview']);
  }
}
