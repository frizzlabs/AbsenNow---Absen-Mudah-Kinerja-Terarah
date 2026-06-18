import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';
import { LeaveRadioCardComponent } from '../../../../shared/components/leave-radio-card/leave-radio-card.component';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../../core/services/leave.service';

@Component({
  selector: 'app-create-delegate',
  templateUrl: './create-delegate.page.html',
  styleUrls: ['./create-delegate.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, LeaveStepperComponent, LeaveRadioCardComponent]
})
export class CreateDelegatePage implements OnInit {
  skipDelegate: boolean = false;
  selectedDelegateId: number | null = null;
  searchQuery: string = '';

  delegates: any[] = [];
  filteredDelegates: any[] = [];

  constructor(
    private router: Router,
    private leaveService: LeaveService
  ) { }

  ngOnInit() {
    this.loadDelegates();
  }

  loadDelegates() {
    this.leaveService.getDelegates().subscribe({
      next: (users) => {
        this.delegates = users.map(u => {
          let role = 'Team Member';
          let avatar = 'assets/images/avatar-hanna.png';
          let status = 'success';
          if (u.name.toLowerCase().includes('hanna')) {
            role = 'Senior Project Manager';
            avatar = 'assets/images/avatar-hanna.png';
          } else if (u.name.toLowerCase().includes('michael')) {
            role = 'UX Designer';
            avatar = 'assets/images/avatar-michael.png';
          } else if (u.name.toLowerCase().includes('david')) {
            role = 'QA Lead';
            avatar = 'assets/images/avatar-david.png';
            status = 'medium';
          } else if (u.name.toLowerCase().includes('emma')) {
            role = 'Product Marketing';
            avatar = 'assets/images/avatar-emma.png';
          }
          return {
            id: u.id,
            name: u.name,
            role,
            avatar,
            status
          };
        });

        this.filterDelegates();

        // Restore state
        if (this.leaveService.draftRequest.delegate_user_id) {
          this.selectedDelegateId = this.leaveService.draftRequest.delegate_user_id;
          this.skipDelegate = false;
        } else if (this.leaveService.draftRequest.delegate_name === 'none') {
          this.skipDelegate = true;
        } else if (this.delegates.length > 0) {
          this.selectedDelegateId = this.delegates[0].id;
        }
      },
      error: (err) => console.error('Failed to load delegates', err)
    });
  }

  filterDelegates() {
    if (!this.searchQuery.trim()) {
      this.filteredDelegates = this.delegates;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredDelegates = this.delegates.filter(d => 
        d.name.toLowerCase().includes(q) || d.role.toLowerCase().includes(q)
      );
    }
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target.value || '';
    this.filterDelegates();
  }

  goBack() {
    this.router.navigate(['/leave/create/dates']);
  }

  selectDelegate(id: number) {
    if (!this.skipDelegate) {
      this.selectedDelegateId = id;
    }
  }

  continue() {
    if (this.skipDelegate) {
      this.leaveService.draftRequest.delegate_user_id = null;
      this.leaveService.draftRequest.delegate_name = 'none';
    } else {
      const selected = this.delegates.find(d => d.id === this.selectedDelegateId);
      if (selected) {
        this.leaveService.draftRequest.delegate_user_id = selected.id;
        this.leaveService.draftRequest.delegate_name = selected.name;
      }
    }
    this.router.navigate(['/leave/create/upload']);
  }
}
