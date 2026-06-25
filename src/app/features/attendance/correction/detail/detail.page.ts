import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CorrectionService } from '../../../../core/services/correction.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-correction-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent]
})
export class CorrectionDetailPage {
  correction: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private correctionService: CorrectionService
  ) {}

  ionViewWillEnter() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) return;
    this.isLoading = true;
    this.correctionService.getCorrection(id).subscribe({
      next: (data) => { this.correction = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  typeLabel(type: string): string { return this.correctionService.typeLabelOf(type); }
  statusLabel(s: string): string  { return this.correctionService.statusLabel(s); }
  statusColor(s: string): string  { return this.correctionService.statusColor(s); }

  formatDate(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatAt(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
