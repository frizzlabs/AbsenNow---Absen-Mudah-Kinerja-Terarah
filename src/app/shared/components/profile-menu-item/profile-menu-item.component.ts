import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile-menu-item',
  templateUrl: './profile-menu-item.component.html',
  styleUrls: ['./profile-menu-item.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProfileMenuItemComponent {
  @Input() iconName: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
