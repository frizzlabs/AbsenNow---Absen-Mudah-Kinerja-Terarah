import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CorrectionService } from '../../../../core/services/correction.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, ButtonComponent]
})
export class FormPage {
  constructor(public correctionService: CorrectionService, private router: Router) {}

  get draft() { return this.correctionService.draft; }

  get needsCheckin(): boolean {
    return ['forgot_checkin', 'gps_error', 'app_error', 'dinas_luar', 'other'].includes(this.draft.correctionType);
  }

  get needsCheckout(): boolean {
    return ['forgot_checkout', 'gps_error', 'app_error', 'dinas_luar', 'other'].includes(this.draft.correctionType);
  }

  get typeLabelFormatted(): string {
    return this.correctionService.typeLabelOf(this.draft.correctionType);
  }

  get dateFormatted(): string {
    if (!this.draft.date) return '-';
    const d = new Date(this.draft.date);
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  get charCount(): number { return this.draft.justification?.length ?? 0; }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.draft.evidenceFile = file;
    this.draft.evidencePreview = null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { this.draft.evidencePreview = e.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  removeEvidence() {
    this.draft.evidenceFile = null;
    this.draft.evidencePreview = null;
  }

  get isValid(): boolean {
    if (!this.draft.justification || this.draft.justification.length < 10) return false;
    if (this.needsCheckin  && !this.draft.proposedCheckin)  return false;
    if (this.draft.correctionType === 'forgot_checkout' && !this.draft.proposedCheckout) return false;
    return true;
  }

  goNext() {
    if (!this.isValid) return;
    this.router.navigate(['/attendance/correction/summary']);
  }

  goBack() {
    this.router.navigate(['/attendance/correction/reason']);
  }
}
