import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';
import { LeaveRadioCardComponent } from '../../../../shared/components/leave-radio-card/leave-radio-card.component';
import { LeaveService } from '../../../../core/services/leave.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-create-type',
  templateUrl: './create-type.page.html',
  styleUrls: ['./create-type.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TranslatePipe, LeaveStepperComponent, LeaveRadioCardComponent, PageHeaderComponent, BottomNavComponent]
})
export class CreateTypePage implements OnInit {
  selectedType: string = 'annual';
  balances: any[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private leaveService: LeaveService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.selectedType = this.leaveService.draftRequest.leave_type || 'annual';
    this.loadBalances();
  }

  loadBalances() {
    this.isLoading = true;
    this.leaveService.getBalances().subscribe({
      next: (balances) => {
        this.balances = balances;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load balances in CreateTypePage', err);
        this.isLoading = false;
      }
    });
  }

  getRemainingDays(type: string): string {
    const bal = this.balances.find(b => b.leave_type === type);
    if (!bal) {
      if (type === 'annual') return this.translate.instant('leave.annualLeaveDefault');
      if (type === 'sick') return this.translate.instant('leave.sickLeaveDefault');
      return this.translate.instant('leave.unlimited');
    }
    const remaining = bal.allocated - bal.used;
    return `${remaining} ${this.translate.instant('leave.days')}`;
  }

  goBack() {
    this.router.navigate(['/leave/home']);
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  continue() {
    this.leaveService.draftRequest.leave_type = this.selectedType;
    this.router.navigate(['/leave/create/dates']);
  }
}
