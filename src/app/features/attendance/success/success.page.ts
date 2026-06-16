import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AttendanceStateService } from '../../../core/services/attendance-state.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, ButtonComponent]
})
export class SuccessPage implements OnInit {
  isCheckingOut = false;
  recordedTime = '08:58 AM';
  recordedDate = 'Feb 18, 2025';
  recordedLocation = 'Headquarters, Jakarta';

  constructor(private navCtrl: NavController, private attendanceService: AttendanceStateService) {
    this.isCheckingOut = this.attendanceService.state === 'checked_in';
  }

  ngOnInit() {
    this.recordedTime = localStorage.getItem('success_time') || '08:58 AM';
    this.recordedDate = localStorage.getItem('success_date') || 'Feb 18, 2025';
    const address = localStorage.getItem('success_office_address') || 'Headquarters, Jakarta';
    this.recordedLocation = address.length > 28 ? address.substring(0, 25) + '...' : address;
  }

  goToHome() {
    if (this.isCheckingOut) {
      this.attendanceService.performCheckOut();
    } else {
      this.attendanceService.performCheckIn();
    }
    this.navCtrl.navigateRoot('/home');
  }
}
