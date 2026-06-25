import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.page.html',
  styleUrls: ['./team-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, BottomNavComponent]
})
export class TeamListPage implements OnInit {
  selectedDate = new Date().toISOString().split('T')[0];
  search = '';
  records: any[] = [];
  isLoading = true;
  private searchTimer: any;

  constructor(
    private attendanceService: AttendanceService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    const d = this.route.snapshot.queryParamMap.get('date');
    if (d) this.selectedDate = d;
    this.load();
  }

  load() {
    this.isLoading = true;
    this.attendanceService.getTeamList(this.selectedDate, this.search).subscribe({
      next: (data) => { this.records = data.records; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  onDateChange() { this.load(); }

  onSearchChange() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 400);
  }

  dateFormatted(): string {
    return new Date(this.selectedDate + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  statusLabel(s: string): string {
    return ({ present: 'Hadir', late: 'Terlambat', absent: 'Belum Absen' } as any)[s] ?? s;
  }

  duration(checkIn: string, checkOut: string): string {
    if (!checkIn || !checkOut) return '';
    const [ih, im] = checkIn.split(':').map(Number);
    const [oh, om] = checkOut.split(':').map(Number);
    const mins = (oh * 60 + om) - (ih * 60 + im);
    if (mins < 0) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
  }

  goBack() { this.location.back(); }
}
