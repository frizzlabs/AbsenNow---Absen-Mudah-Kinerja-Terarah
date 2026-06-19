import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveStepperComponent } from '../../../../shared/components/leave-stepper/leave-stepper.component';
import { LeaveService } from '../../../../core/services/leave.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-upload',
  templateUrl: './create-upload.page.html',
  styleUrls: ['./create-upload.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LeaveStepperComponent, PageHeaderComponent]
})
export class CreateUploadPage implements OnInit {
  fileName: string | null = null;
  fileSizeText: string | null = null;

  constructor(
    private router: Router,
    private leaveService: LeaveService
  ) { }

  ngOnInit() {
    if (this.leaveService.draftRequest.attachment_name) {
      this.fileName = this.leaveService.draftRequest.attachment_name;
      this.fileSizeText = this.leaveService.draftRequest.attachment_size || null;
    }
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const sizeText = `${sizeInMB} MB`;
      this.fileSizeText = sizeText;

      const fileType = file.name.split('.').pop()?.toUpperCase() || 'FILE';

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.leaveService.draftRequest.attachment = base64String;
        this.leaveService.draftRequest.attachment_name = file.name;
        this.leaveService.draftRequest.attachment_size = sizeText;
        this.leaveService.draftRequest.attachment_type = fileType;
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile() {
    this.fileName = null;
    this.fileSizeText = null;
    this.leaveService.draftRequest.attachment = null;
    this.leaveService.draftRequest.attachment_name = null;
    this.leaveService.draftRequest.attachment_size = null;
    this.leaveService.draftRequest.attachment_type = null;
  }

  goBack() {
    this.router.navigate(['/leave/create/delegate']);
  }

  continue() {
    this.router.navigate(['/leave/create/summary']);
  }
}
