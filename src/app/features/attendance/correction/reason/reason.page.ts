import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CorrectionService, CORRECTION_TYPES } from '../../../../core/services/correction.service';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-reason',
  templateUrl: './reason.page.html',
  styleUrls: ['./reason.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, ButtonComponent, BottomNavComponent]
})
export class ReasonPage {
  types = CORRECTION_TYPES;
  maxDate = new Date().toISOString().slice(0, 10);

  constructor(public correctionService: CorrectionService, private router: Router) {}

  ionViewWillEnter() {
    // Reset jika baru mulai (bukan kembali dari form)
  }

  get draft() { return this.correctionService.draft; }

  goNext() {
    if (!this.draft.date || !this.draft.correctionType) return;
    this.router.navigate(['/attendance/correction/form']);
  }
}
