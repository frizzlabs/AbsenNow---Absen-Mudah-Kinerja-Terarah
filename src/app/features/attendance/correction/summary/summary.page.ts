import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, ButtonComponent]
})
export class SummaryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
