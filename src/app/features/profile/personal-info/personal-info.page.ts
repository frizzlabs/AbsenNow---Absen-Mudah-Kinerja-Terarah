import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.page.html',
  styleUrls: ['./personal-info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, SectionCardComponent, ButtonComponent]
})
export class PersonalInfoPage {
  user: any = null;

  constructor(private profileService: ProfileService) {}

  ionViewWillEnter() {
    const cached = localStorage.getItem('user');
    if (cached) {
      try { this.user = JSON.parse(cached); } catch (e) {}
    }
    this.profileService.getProfile().subscribe({
      next: (u) => (this.user = u),
      error: () => {}
    });
  }

  get dobLabel(): string {
    if (!this.user?.date_of_birth) return '-';
    try {
      return new Date(this.user.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return this.user.date_of_birth;
    }
  }
}
