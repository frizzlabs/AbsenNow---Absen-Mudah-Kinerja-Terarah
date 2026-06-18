import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-team-dashboard',
  templateUrl: './team-dashboard.page.html',
  styleUrls: ['./team-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TeamDashboardPage implements OnInit {
  selectedDate = new Date().toISOString().split('T')[0];
  summary: any = null;
  employees: any[] = [];
  isLoading = true;
  activeFilter: 'all' | 'present' | 'late' | 'absent' = 'all';

  constructor(
    private attendanceService: AttendanceService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.attendanceService.getTeamToday(this.selectedDate).subscribe({
      next: (data) => {
        this.summary = data.summary;
        this.employees = data.employees;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onDateChange() { this.load(); }
  setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

  get filtered(): any[] {
    if (this.activeFilter === 'all') return this.employees;
    return this.employees.filter(e => e.status === this.activeFilter);
  }

  dateFormatted(): string {
    return new Date(this.selectedDate + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  statusLabel(s: string): string {
    return ({ present: 'Hadir', late: 'Terlambat', absent: 'Belum Absen' } as any)[s] ?? s;
  }

  goList() {
    this.router.navigate(['/attendance/team-list'], { queryParams: { date: this.selectedDate } });
  }

  goBack() { this.location.back(); }
}
