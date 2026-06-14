import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveBalanceCardComponent } from '../../../../shared/components/leave-balance-card/leave-balance-card.component';
import { LeaveRequestCardComponent } from '../../../../shared/components/leave-request-card/leave-request-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LeaveBalanceCardComponent, LeaveRequestCardComponent]
})
export class HomePage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/']);
  }

  viewHistory() {
    this.router.navigate(['/leave/history']);
  }

  requestLeave() {
    this.router.navigate(['/leave/create/type']);
  }
}
