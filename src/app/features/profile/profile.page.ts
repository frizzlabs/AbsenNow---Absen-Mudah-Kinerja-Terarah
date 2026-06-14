import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfileMenuItemComponent } from '../../shared/components/profile-menu-item/profile-menu-item.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, ProfileMenuItemComponent, BottomNavComponent, TranslatePipe]
})
export class ProfilePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
