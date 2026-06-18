import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PermissionService } from '../../../../core/services/permission.service';

@Component({
  selector: 'app-permission-request',
  templateUrl: './request.page.html',
  styleUrls: ['./request.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RequestPage implements OnInit {
  title: string = '';
  category: string = 'personal';
  permissionDate: string = '';
  startTime: string = '09:00';
  endTime: string = '10:30';
  notes: string = '';

  fileName: string | null = null;
  fileSizeText: string | null = null;
  base64File: string | null = null;
  fileType: string | null = null;

  constructor(
    private router: Router,
    private permissionService: PermissionService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const draft = this.permissionService.draftRequest;
    this.title = draft.title;
    this.category = draft.category;
    this.permissionDate = draft.permission_date;
    this.startTime = draft.start_time || '09:00';
    this.endTime = draft.end_time || '10:30';
    this.notes = draft.notes;
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
    this.router.navigate(['/permission']);
  }

  async continue() {
    if (!this.title.trim()) {
      this.showToast('Please enter the purpose/title.');
      return;
    }
    if (!this.permissionDate) {
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

    // Save to service draft state
    this.permissionService.draftRequest = {
      title: this.title,
      category: this.category,
      permission_date: this.permissionDate,
      start_time: this.startTime,
      end_time: this.endTime,
      notes: this.notes,
      attachment: this.base64File,
      attachment_name: this.fileName,
      attachment_size: this.fileSizeText,
      attachment_type: this.fileType
    };

    this.router.navigate(['/permission/review']);
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
