import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ExpenseStepperComponent } from '../../../../shared/components/expense-stepper/expense-stepper.component';
import { ExpenseReceiptPreviewComponent } from '../../../../shared/components/expense-receipt-preview/expense-receipt-preview.component';
import { ExpenseService } from '../../../../core/services/expense.service';

@Component({
  selector: 'app-create-step2',
  templateUrl: './create-step2.page.html',
  styleUrls: ['./create-step2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, ExpenseStepperComponent, ExpenseReceiptPreviewComponent]
})
export class CreateStep2Page implements OnInit {
  fileName: string | null = null;
  fileSizeText: string | null = null;

  constructor(
    private router: Router,
    public expenseService: ExpenseService,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    if (this.expenseService.draftRequest.receipt_name) {
      this.fileName = this.expenseService.draftRequest.receipt_name;
      this.fileSizeText = this.expenseService.draftRequest.receipt_size;
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
        this.expenseService.draftRequest.receipt = base64String;
        this.expenseService.draftRequest.receipt_name = file.name;
        this.expenseService.draftRequest.receipt_size = sizeText;
        this.expenseService.draftRequest.receipt_type = fileType;
      };
      reader.onerror = (error) => {
        console.error('Error reading receipt:', error);
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile() {
    this.fileName = null;
    this.fileSizeText = null;
    this.expenseService.draftRequest.receipt = null;
    this.expenseService.draftRequest.receipt_name = null;
    this.expenseService.draftRequest.receipt_size = null;
    this.expenseService.draftRequest.receipt_type = null;
  }

  goBack() {
    this.router.navigate(['/expense/create/step-1']);
  }

  async next() {
    if (!this.fileName) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Processing receipt with AI...',
      duration: 1500,
      spinner: 'crescent'
    });
    await loading.present();

    const lowerName = (this.fileName || '').toLowerCase();
    let merchant = 'General Store';
    let amount = 25.50;
    
    if (lowerName.includes('bistro') || lowerName.includes('lunch') || lowerName.includes('eat')) {
      merchant = 'The Corner Bistro';
      amount = 45.00;
    } else if (lowerName.includes('uber') || lowerName.includes('taxi') || lowerName.includes('ride')) {
      merchant = 'Uber Indonesia';
      amount = 15.00;
    } else if (lowerName.includes('flight') || lowerName.includes('travel') || lowerName.includes('plane')) {
      merchant = 'Garuda Indonesia';
      amount = 350.00;
    } else if (lowerName.includes('hotel') || lowerName.includes('stay') || lowerName.includes('inn')) {
      merchant = 'Hotel Santika';
      amount = 120.00;
    } else if (lowerName.includes('supply') || lowerName.includes('paper') || lowerName.includes('office')) {
      merchant = 'Gramedia';
      amount = 62.75;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    this.expenseService.draftRequest.merchant = this.expenseService.draftRequest.merchant || merchant;
    this.expenseService.draftRequest.amount = this.expenseService.draftRequest.amount || amount;
    this.expenseService.draftRequest.expense_date = this.expenseService.draftRequest.expense_date || formattedDate;

    await loading.onDidDismiss();
    this.router.navigate(['/expense/create/step-3']);
  }
}
