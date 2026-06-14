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

  constructor(private navCtrl: NavController, private attendanceService: AttendanceStateService) {
    this.isCheckingOut = this.attendanceService.state === 'checked_in';
  }

  ngOnInit() {
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
