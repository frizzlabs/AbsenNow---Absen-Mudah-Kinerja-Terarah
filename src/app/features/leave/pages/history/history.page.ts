import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveHistoryCardComponent } from '../../../../shared/components/leave-history-card/leave-history-card.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LeaveHistoryCardComponent]
})
export class HistoryPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/leave/home']);
  }
}
