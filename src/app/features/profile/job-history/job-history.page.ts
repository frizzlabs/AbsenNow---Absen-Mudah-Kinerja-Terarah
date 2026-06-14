import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-job-history',
  templateUrl: './job-history.page.html',
  styleUrls: ['./job-history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent]
})
export class JobHistoryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
