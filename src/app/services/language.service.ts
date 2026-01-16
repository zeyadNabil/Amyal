import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Translations {
  nav: {
    home: string;
    productsServices: string;
    exhibitionStand: string;
    exhibitionBoothDesign: string;
    displayUnitsMallKiosk: string;
    eventManagement: string;
    brandAmbassadorsEventHosts: string;
    avService: string;
    vehicleBrandingWrapping: string;
    stickersCustomPrints: string;
    fabricationManufacturing: string;
    gallery: string;
    contact: string;
    about: string;
    partners: string;
    getQuote: string;
  };
  hero: {
    title: string;
    titleGradient: string;
    subtitle: string;
    cta: string;
  };
  about: {
    title: string;
    subtitle: string;
    heading: string;
    text1: string;
    text2: string;
    stat1: string;
    stat2: string;
    stat3: string;
    feature1Title: string;
    feature1Text: string;
    feature2Title: string;
    feature2Text: string;
    feature3Title: string;
    feature3Text: string;
    feature4Title: string;
    feature4Text: string;
  };
  aboutUs: {
    title: string;
    whoWeAre: {
      title: string;
      subtitle: string;
      text1: string;
      text2: string;
      text3: string;
    };
    whyChooseUs: {
      title: string;
      feature1: { title: string; text: string; };
      feature2: { title: string; text: string; };
      feature3: { title: string; text: string; };
      feature4: { title: string; text: string; };
      feature5: { title: string; text: string; };
    };
    mission: { title: string; text: string; };
    vision: { title: string; text: string; };
    howWeWork: {
      title: string;
      step1: { title: string; text: string; };
      step2: { title: string; text: string; };
      step3: { title: string; text: string; };
      step4: { title: string; text: string; };
    };
  };
  gallery: {
    title: string;
    subtitle: string;
    project1: string;
    project2: string;
    project3: string;
    project4: string;
    project5: string;
    project6: string;
    category1: string;
    category2: string;
    category3: string;
    category4: string;
    category5: string;
    category6: string;
  };
  contact: {
    title: string;
    subtitle: string;
    heading: string;
    text: string;
    phone: string;
    email: string;
    location: string;
    address: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    messagePlaceholder: string;
    submit: string;
  };
  footer: {
    text: string;
    aboutUs: string;
    usefulLinks: string;
    ourServices: string;
    socialMedia: string;
    companyProfile: string;
    services: string;
    ourWork: string;
    blog: string;
    contactUs: string;
    phone: string;
    email: string;
    address: string;
    copyright: string;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSignal = signal<string>('en');
  private translationsSignal = signal<Translations | null>(null);

  // Public readonly signals
  currentLang = this.currentLangSignal.asReadonly();
  translations = this.translationsSignal.asReadonly();

  // Computed signal for language button text
  languageButtonText = computed(() =>
    this.currentLangSignal() === 'en' ? 'العربية' : 'English'
  );

  // Computed signal for text direction
  isRTL = computed(() => this.currentLangSignal() === 'ar');

  constructor(private http: HttpClient) {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.loadLanguage(savedLang);
  }

  loadLanguage(lang: string): void {
    this.http.get<Translations>(`assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translationsSignal.set(data);
        this.currentLangSignal.set(lang);

        // Update HTML attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Save preference
        localStorage.setItem('lang', lang);
      },
      error: (err) => console.error('Error loading translations:', err)
    });
  }

  toggleLanguage(): void {
    const newLang = this.currentLangSignal() === 'en' ? 'ar' : 'en';
    this.loadLanguage(newLang);
  }

  getTranslation(key: string): string {
    const trans = this.translationsSignal();
    if (!trans) return key;

    const keys = key.split('.');
    let value: any = trans;

    for (const k of keys) {
      value = value?.[k];
      if (!value) return key;
    }

    return value;
  }

  // Helper method to get nested translation
  t(key: string): string {
    return this.getTranslation(key);
  }
}

