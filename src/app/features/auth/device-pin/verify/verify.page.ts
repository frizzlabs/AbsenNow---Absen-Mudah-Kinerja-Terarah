import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthHeaderIconComponent } from '../../../../shared/components/auth-header-icon/auth-header-icon.component';
import { PinDotsComponent } from '../../../../shared/components/pin-dots/pin-dots.component';
import { NumpadComponent } from '../../../../shared/components/numpad/numpad.component';

import { Router } from '@angular/router';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, AuthHeaderIconComponent, PinDotsComponent, NumpadComponent]
})
export class VerifyPage implements OnInit {
  pinValue: string = '';
  
  constructor(private router: Router) { }
  ngOnInit() { }
  
  onKeyPress(key: string) {
    if (key === 'backspace') {
      this.pinValue = this.pinValue.slice(0, -1);
    } else if (this.pinValue.length < 4) {
      this.pinValue += key;
      if (this.pinValue.length === 4) {
        setTimeout(() => this.router.navigateByUrl('/home', { replaceUrl: true }), 300);
      }
    }
  }
}
