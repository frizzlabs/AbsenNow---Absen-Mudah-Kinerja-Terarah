import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CardComponent, StatusBadgeComponent]
})
export class HistoryPage implements OnInit {
  historyLogs: any[] = [];
  isLoading = true;

  constructor(
    private attendanceService: AttendanceService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.attendanceService.getHistory().subscribe({
      next: (data) => {
        this.historyLogs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  calculateDuration(checkIn: string, checkOut: string | null): string {
    if (!checkOut) return '-';
    try {
      const [hIn, mIn] = checkIn.split(':').map(Number);
      const [hOut, mOut] = checkOut.split(':').map(Number);
      
      let diffMinutes = (hOut * 60 + mOut) - (hIn * 60 + mIn);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    } catch (e) {
      return '-';
    }
  }

  formatTime12(timeStr: string | null): string {
    if (!timeStr) return '-';
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  }
}
