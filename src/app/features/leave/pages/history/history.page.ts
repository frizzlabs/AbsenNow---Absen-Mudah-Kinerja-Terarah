import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveHistoryCardComponent } from '../../../../shared/components/leave-history-card/leave-history-card.component';
import { LeaveService } from '../../../../core/services/leave.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

interface HistoryGroup {
  monthYear: string;
  requests: any[];
}

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LeaveHistoryCardComponent, PageHeaderComponent, BottomNavComponent]
})
export class HistoryPage implements OnInit {
  isLoading = true;
  groups: HistoryGroup[] = [];

  constructor(
    private router: Router,
    private leaveService: LeaveService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.leaveService.getRequests().subscribe({
      next: (requests) => {
        this.groupRequests(requests);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load leave history requests', err);
        this.isLoading = false;
      }
    });
  }

  groupRequests(requests: any[]) {
    const tempGroups: { [key: string]: any[] } = {};

    requests.forEach(req => {
      try {
        const d = new Date(req.start_date);
        const monthName = d.toLocaleDateString('id-ID', { month: 'long' }).toUpperCase();
        const year = d.getFullYear();
        const key = `${monthName} ${year}`;
        
        if (!tempGroups[key]) {
          tempGroups[key] = [];
        }
        tempGroups[key].push(req);
      } catch (e) {
        const key = 'OTHER';
        if (!tempGroups[key]) {
          tempGroups[key] = [];
        }
        tempGroups[key].push(req);
      }
    });

    this.groups = Object.keys(tempGroups).map(key => ({
      monthYear: key,
      requests: tempGroups[key]
    }));
  }

  getLeaveTypeName(type: string): string {
    const mapping: { [key: string]: string } = {
      annual: 'Cuti Tahunan',
      sick: 'Cuti Sakit',
      unpaid: 'Cuti Diluar Tanggungan'
    };
    return mapping[type] || 'Pengajuan Cuti';
  }

  getIconName(type: string): string {
    switch (type) {
      case 'annual': return 'umbrella-outline';
      case 'sick': return 'medkit-outline';
      default: return 'wallet-outline';
    }
  }

  getIconColorClass(type: string): string {
    switch (type) {
      case 'annual': return 'primary';
      case 'sick': return 'warning';
      default: return 'medium';
    }
  }

  formatDuration(req: any): string {
    try {
      const start = new Date(req.start_date);
      const end = new Date(req.end_date);
      
      const startStr = start.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      
      if (req.start_date === req.end_date) {
        return start.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return `${startStr} - ${endStr}`;
    } catch (e) {
      return '';
    }
  }

  formatTotalDays(days: number): string {
    return `${days} Hari`;
  }

  goBack() {
    this.router.navigate(['/leave/home']);
  }
}
