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
  selector: 'app-new-password',
  templateUrl: './new-password.page.html',
  styleUrls: ['./new-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, AuthHeaderIconComponent, InputComponent, ButtonComponent]
})
export class NewPasswordPage implements OnInit {
  constructor(private router: Router) { }
  ngOnInit() { }

  resetPassword() {
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
