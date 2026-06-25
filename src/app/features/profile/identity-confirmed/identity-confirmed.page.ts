import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { VerificationStatusComponent } from '../../../shared/components/verification-status/verification-status.component';
import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { RouterModule } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-identity-confirmed',
  templateUrl: './identity-confirmed.page.html',
  styleUrls: ['./identity-confirmed.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, VerificationStatusComponent, SectionCardComponent, ButtonComponent, BottomNavComponent]
})
export class IdentityConfirmedPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
