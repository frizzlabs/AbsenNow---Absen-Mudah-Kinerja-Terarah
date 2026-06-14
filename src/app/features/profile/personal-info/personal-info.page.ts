import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.page.html',
  styleUrls: ['./personal-info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, SectionCardComponent, ButtonComponent]
})
export class PersonalInfoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
