import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { LanguageService } from './services/language.service';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';

function initializeApp(languageService: LanguageService): () => Promise<void> {
  return async () => {
    const savedLang = localStorage.getItem('lang') || 'en';
    await firstValueFrom(
      languageService.loadLanguageSync(savedLang)
    );
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [LanguageService],
      multi: true
    }
  ]
};
