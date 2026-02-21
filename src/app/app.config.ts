import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { LanguageService } from './services/language.service';
import { ThemeService } from './services/theme.service';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';

function initializeApp(languageService: LanguageService, themeService: ThemeService): () => Promise<void> {
  return async () => {
    const savedLang = localStorage.getItem('lang') || 'en';
    await Promise.all([
      firstValueFrom(languageService.loadLanguageSync(savedLang)),
      themeService.loadTheme()
    ]);
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
      deps: [LanguageService, ThemeService],
      multi: true
    }
  ]
};
