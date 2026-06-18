import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IdentityService } from '../../../core/services/identity.service';

@Component({
  selector: 'app-identity-required',
  templateUrl: './identity-required.page.html',
  styleUrls: ['./identity-required.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, PageHeaderComponent, SectionCardComponent, ButtonComponent]
})
export class IdentityRequiredPage {
  isLoading = true;

  constructor(private identityService: IdentityService, private router: Router) {}

  ionViewWillEnter() {
    this.identityService.getIdentity().subscribe({
      next: (identity) => {
        this.isLoading = false;
        if (identity) {
          // Already submitted — show the data page
          this.router.navigateByUrl('/profile/identity/filled', { replaceUrl: true });
        }
      },
      error: () => { this.isLoading = false; }
    });
  }
}
