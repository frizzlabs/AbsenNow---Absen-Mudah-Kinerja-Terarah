import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ai-chat-suggested',
  templateUrl: './suggested.page.html',
  styleUrls: ['./suggested.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class SuggestedPage {
  constructor() {}
}
