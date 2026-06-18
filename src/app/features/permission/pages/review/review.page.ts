import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PermissionService } from '../../../../core/services/permission.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-permission-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ReviewPage implements OnInit {
  draft: any = null;
  isChecked = false;
  isSubmitting = false;

  constructor(
    private router: Router,
    private permissionService: PermissionService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.draft = this.permissionService.draftRequest;
    if (!this.draft || !this.draft.title) {
      this.router.navigate(['/permission/request']);
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  }

  formatCategory(cat: string): string {
    const mapping: { [key: string]: string } = {
      personal: 'Personal Permission',
      family: 'Family Emergency',
      emergency: 'House Emergency',
      other: 'Other'
    };
    return mapping[cat] || cat;
  }

  goBack() {
    this.router.navigate(['/permission/request']);
  }

  async submitRequest() {
    if (!this.isChecked) {
      this.showToast('Please confirm the accuracy of your request.');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: 'Submitting request...',
    });
    await loading.present();

    const payload = {
      title: this.draft.title,
      category: this.draft.category,
      permission_date: this.draft.permission_date,
      start_time: this.draft.start_time,
      end_time: this.draft.end_time,
      notes: this.draft.notes,
      attachment: this.draft.attachment,
      attachment_name: this.draft.attachment_name
    };

    this.permissionService.submitRequest(payload).subscribe({
      next: (res) => {
        loading.dismiss();
        this.isSubmitting = false;
        
        localStorage.setItem('last_submitted_permission', JSON.stringify(res.permission));
        
        this.router.navigate(['/permission/success']);
      },
      error: async (err) => {
        loading.dismiss();
        this.isSubmitting = false;
        const errMsg = err.error?.message || 'Failed to submit permission request.';
        const toast = await this.toastController.create({
          message: errMsg,
          duration: 3500,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }
}
