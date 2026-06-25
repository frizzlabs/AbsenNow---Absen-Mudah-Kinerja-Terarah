import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-ai-chat-suggested',
  templateUrl: './suggested.page.html',
  styleUrls: ['./suggested.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, PageHeaderComponent, BottomNavComponent]
})
export class SuggestedPage {
  constructor() {}
}
