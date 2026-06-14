import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ai-chat-expanded',
  templateUrl: './expanded.page.html',
  styleUrls: ['./expanded.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ExpandedPage {
  constructor() {}
}
