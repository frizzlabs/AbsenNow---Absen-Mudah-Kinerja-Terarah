import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANG_KEY = 'karajo_lang';

  constructor(private translate: TranslateService) {
    this.initLanguage();
  }

  initLanguage() {
    const savedLang = localStorage.getItem(this.LANG_KEY);
    if (savedLang) {
      this.translate.setFallbackLang(savedLang);
      this.translate.use(savedLang);
    } else {
      this.translate.setFallbackLang('en');
      this.translate.use('en');
      localStorage.setItem(this.LANG_KEY, 'en');
    }
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  getCurrentLanguage(): string {
    return localStorage.getItem(this.LANG_KEY) || 'en';
  }
}
