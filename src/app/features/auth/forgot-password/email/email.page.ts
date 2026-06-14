import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthHeaderIconComponent } from '../../../../shared/components/auth-header-icon/auth-header-icon.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-email',
  templateUrl: './email.page.html',
  styleUrls: ['./email.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, AuthHeaderIconComponent, InputComponent, ButtonComponent]
})
export class EmailPage implements OnInit {
  constructor(private router: Router) { }
  ngOnInit() { }

  sendCode() {
    this.router.navigateByUrl('/auth/forgot-password/verification');
  }
}
