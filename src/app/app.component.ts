import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { LanguageService } from './shared/services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private languageService: LanguageService) {
    // Map all camelCase icon names to kebab-case to ensure string names match in templates
    const kebabIcons: any = {};
    Object.keys(allIcons).forEach(key => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      kebabIcons[kebabKey] = (allIcons as any)[key];
    });
    addIcons({ ...allIcons, ...kebabIcons });
    
    this.setupDevUtilities();
  }

  private setupDevUtilities() {
    // Temporary development utility to reset onboarding/authentication state
    (window as any).resetAppState = () => {
      localStorage.removeItem('isNewUser');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('hasPin');
      console.log('✅ App state reset successfully.');
      console.log('🔄 Reload the page to restart the Splash -> Onboarding flow.');
      window.location.href = '/'; // Optional: Auto redirect to trigger splash
    };
  }
}
