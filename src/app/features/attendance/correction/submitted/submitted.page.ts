import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CorrectionService } from '../../../../core/services/correction.service';

@Component({
  selector: 'app-submitted',
  templateUrl: './submitted.page.html',
  styleUrls: ['./submitted.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ButtonComponent]
})
export class SubmittedPage {
  constructor(public correctionService: CorrectionService, private router: Router) {}

  get data() { return this.correctionService.lastSubmitted; }

  get typeLabel(): string {
    return this.data ? this.correctionService.typeLabelOf(this.data.correction_type) : '-';
  }

  get dateFormatted(): string {
    if (!this.data?.correction_date) return '-';
    return new Date(this.data.correction_date).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  goToHistory() {
    this.router.navigate(['/attendance/correction/history']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
