import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-monthly-summary',
  templateUrl: './monthly-summary.page.html',
  styleUrls: ['./monthly-summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe, PageHeaderComponent, ButtonComponent, BottomNavComponent]
})
export class MonthlySummaryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
