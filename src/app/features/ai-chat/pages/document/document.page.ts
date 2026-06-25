import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-ai-chat-document',
  templateUrl: './document.page.html',
  styleUrls: ['./document.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent]
})
export class DocumentPage {
  constructor() {}
}
