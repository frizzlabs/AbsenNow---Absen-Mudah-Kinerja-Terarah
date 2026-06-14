import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../shared/services/language.service';

@Component({
  selector: 'app-language-settings',
  templateUrl: './language.page.html',
  styleUrls: ['./language.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, TranslatePipe]
})
export class LanguageSettingsPage {
  languages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Bahasa Indonesia' }
  ];

  constructor(public languageService: LanguageService) {}

  selectLanguage(langCode: string) {
    this.languageService.setLanguage(langCode);
  }
}
