import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalFilterComponent } from '../../../shared/components/modal-filter/modal-filter.component';

@Component({
  selector: 'app-history-filter',
  templateUrl: './history-filter.page.html',
  styleUrls: ['./history-filter.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ModalFilterComponent]
})
export class HistoryFilterPage implements OnInit {
  constructor() { }
  ngOnInit() {}
}
