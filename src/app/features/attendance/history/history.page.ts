import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CardComponent, StatusBadgeComponent]
})
export class HistoryPage implements OnInit {
  constructor() { }
  ngOnInit() { }
}
