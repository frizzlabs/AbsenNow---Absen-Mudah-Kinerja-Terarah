import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PageHeaderComponent]
})
export class FilterPage implements OnInit {
  selectedStatus: string = 'Approved';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  close() {
    this.router.navigate(['/expense/history']);
  }
}
