import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthHeaderIconComponent } from '../../../../shared/components/auth-header-icon/auth-header-icon.component';
import { PinDotsComponent } from '../../../../shared/components/pin-dots/pin-dots.component';
import { NumpadComponent } from '../../../../shared/components/numpad/numpad.component';

import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, AuthHeaderIconComponent, PinDotsComponent, NumpadComponent]
})
export class ConfirmPage implements OnInit {
  pinValue: string = '';
  isLoading: boolean = false;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() { }
  
  async onKeyPress(key: string) {
    if (this.isLoading) return;

    if (key === 'backspace') {
      this.pinValue = this.pinValue.slice(0, -1);
    } else if (this.pinValue.length < 4) {
      this.pinValue += key;
      if (this.pinValue.length === 4) {
        const firstPin = localStorage.getItem('temp_pin');
        if (this.pinValue !== firstPin) {
          const toast = await this.toastController.create({
            message: 'PIN does not match. Please try again.',
            duration: 3000,
            position: 'top',
            color: 'danger'
          });
          await toast.present();
          this.pinValue = '';
          return;
        }

        this.isLoading = true;
        this.authService.savePin(this.pinValue).subscribe({
          next: () => {
            this.isLoading = false;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('hasPin', 'true');
            localStorage.removeItem('temp_pin');
            setTimeout(() => this.router.navigateByUrl('/home', { replaceUrl: true }), 300);
          },
          error: async (err) => {
            this.isLoading = false;
            const toast = await this.toastController.create({
              message: err.error?.message || 'Failed to save security PIN.',
              duration: 3000,
              position: 'top',
              color: 'danger'
            });
            await toast.present();
            this.pinValue = '';
          }
        });
      }
    }
  }
}
