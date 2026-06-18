import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-timesheet-monthly',
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent, PageHeaderComponent]
})
export class MonthlyPage {
  constructor(private router: Router) {}

  goWeekly() {
    this.router.navigate(['/timesheet/weekly']);
  }
}
