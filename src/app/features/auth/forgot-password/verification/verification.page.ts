import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthHeaderIconComponent } from '../../../../shared/components/auth-header-icon/auth-header-icon.component';
import { OtpInputComponent } from '../../../../shared/components/otp-input/otp-input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { NumpadComponent } from '../../../../shared/components/numpad/numpad.component';

import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, AuthHeaderIconComponent, OtpInputComponent, ButtonComponent, NumpadComponent]
})
export class VerificationPage implements OnInit {
  otpValue: string = '';
  
  constructor(private router: Router) { }
  ngOnInit() { }
  
  onKeyPress(key: string) {
    if (key === 'backspace') {
      this.otpValue = this.otpValue.slice(0, -1);
    } else if (this.otpValue.length < 6) {
      this.otpValue += key;
    }
  }

  verify() {
    this.router.navigateByUrl('/auth/forgot-password/new-password');
  }
}
