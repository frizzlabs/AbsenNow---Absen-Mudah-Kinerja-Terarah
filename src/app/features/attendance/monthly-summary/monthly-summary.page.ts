import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-monthly-summary',
  templateUrl: './monthly-summary.page.html',
  styleUrls: ['./monthly-summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, ButtonComponent]
})
export class MonthlySummaryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
