import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalFilterComponent } from '../../../shared/components/modal-filter/modal-filter.component';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-history-filter',
  templateUrl: './history-filter.page.html',
  styleUrls: ['./history-filter.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ModalFilterComponent, BottomNavComponent]
})
export class HistoryFilterPage implements OnInit {
  constructor() { }
  ngOnInit() {}
}
