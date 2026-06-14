import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { RouterModule } from '@angular/router';
import { AttendanceStateService } from '../../../core/services/attendance-state.service';

@Component({
  selector: 'app-validation',
  templateUrl: './validation.page.html',
  styleUrls: ['./validation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ButtonComponent, RouterModule]
})
export class ValidationPage implements OnInit {
  isCheckingOut = false;

  constructor(private attendanceService: AttendanceStateService) {
    this.isCheckingOut = this.attendanceService.state === 'checked_in';
  }
  ngOnInit() { }
}
