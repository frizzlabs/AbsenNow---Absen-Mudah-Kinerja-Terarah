import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OvertimeService } from '../../../../core/services/overtime.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-overtime-request-step1',
  templateUrl: './request-step1.page.html',
  styleUrls: ['./request-step1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, PageHeaderComponent]
})
export class RequestStep1Page implements OnInit {
  title: string = '';
  overtimeDate: string = '';
  startTime: string = '18:00';
  endTime: string = '21:00';
  reason: string = '';

  fileName: string | null = null;
  fileSizeText: string | null = null;
  base64File: string | null = null;
  fileType: string | null = null;

  constructor(
    private router: Router,
    private overtimeService: OvertimeService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const draft = this.overtimeService.draftRequest;
    this.title = draft.title;
    this.overtimeDate = draft.overtime_date;
    this.startTime = draft.start_time || '18:00';
    this.endTime = draft.end_time || '21:00';
    this.reason = draft.reason;
    this.fileName = draft.attachment_name;
    this.fileSizeText = draft.attachment_size;
    this.base64File = draft.attachment;
    this.fileType = draft.attachment_type;
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      this.fileSizeText = `${sizeInMB} MB`;
      this.fileType = file.name.split('.').pop()?.toUpperCase() || 'FILE';

      const reader = new FileReader();
      reader.onload = () => {
        this.base64File = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile() {
    this.fileName = null;
    this.fileSizeText = null;
    this.base64File = null;
    this.fileType = null;
  }

  goBack() {
    this.router.navigate(['/overtime']);
  }

  continue() {
    if (!this.title.trim()) {
      this.showToast('Please enter the work description / title.');
      return;
    }
    if (!this.overtimeDate) {
      this.showToast('Please select a date.');
      return;
    }
    if (!this.startTime) {
      this.showToast('Please select a start time.');
      return;
    }
    if (!this.endTime) {
      this.showToast('Please select an end time.');
      return;
    }
    if (this.endTime <= this.startTime) {
      this.showToast('End time must be after start time.');
      return;
    }

    // Save to service draft state
    this.overtimeService.draftRequest = {
      title: this.title,
      overtime_date: this.overtimeDate,
      start_time: this.startTime,
      end_time: this.endTime,
      reason: this.reason,
      attachment: this.base64File,
      attachment_name: this.fileName,
      attachment_size: this.fileSizeText,
      attachment_type: this.fileType
    };

    this.router.navigate(['/overtime/request/step2']);
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
