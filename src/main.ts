import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { importProvidersFrom, isDevMode } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Legacy IonicModule defines ALL Ionic web components (incl. ion-icon).
    // The standalone provideIonicAngular() tree-shook ion-icon out of the prod
    // build, so icons rendered blank on production. forRoot keeps them defined.
    // `animated` only on native → no page-transition "ghosting" on web.
    importProvidersFrom(IonicModule.forRoot({ animated: Capacitor.isNativePlatform() })),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTranslateService({ fallbackLang: 'en' }),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
});
