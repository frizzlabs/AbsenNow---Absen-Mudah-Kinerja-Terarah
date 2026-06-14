import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-ai-chat-document',
  templateUrl: './document.page.html',
  styleUrls: ['./document.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DocumentPage {
  constructor() {}
}
