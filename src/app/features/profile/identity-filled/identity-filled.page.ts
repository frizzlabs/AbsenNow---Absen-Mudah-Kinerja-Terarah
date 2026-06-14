import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { UploadBoxComponent } from '../../../shared/components/upload-box/upload-box.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-identity-filled',
  templateUrl: './identity-filled.page.html',
  styleUrls: ['./identity-filled.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, PageHeaderComponent, SectionCardComponent, UploadBoxComponent, ButtonComponent, InputComponent]
})
export class IdentityFilledPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
