import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-partners',
  imports: [CommonModule],
  templateUrl: './partners.html',
  styleUrl: './partners.css'
})
export class Partners implements OnInit, OnDestroy {
  isLoaded = signal(false);
  typedTitle = signal<string>('');
  isTyping = signal<boolean>(false);
  private scrollObserver?: IntersectionObserver;
  private typingTimeout: any = null;
  private languageEffect: any = null;

  // Partner images array
  partners = [
    'assets/images/Amyal PNG Partners/ADSB.png-Photoroom.png',
    'assets/images/Amyal PNG Partners/608046437_18547185370061322_6214857718704926249_n-Photoroom.png',
    'assets/images/Amyal PNG Partners/573521118_18541182556065137_6745484161360848157_n-Photoroom.png',
    'assets/images/Amyal PNG Partners/547447794_780337308194128_3494187863984613899_n-Photoroom.png',
    'assets/images/Amyal PNG Partners/339510840_557998123096348_1746090769493400815_n-Photoroom.png',
    'assets/images/Amyal PNG Partners/470193135_552416637659210_7339723200037710828_n-Photoroom.png',
    'assets/images/Amyal PNG Partners/275517524_330476512448663_7618378871944497180_n-Photoroom.png',
    'assets/images/Amyal PNG Partners/uae-logo.png',
    'assets/images/Amyal PNG Partners/MOCCAE_Horizontal-en.png',
    'assets/images/Amyal PNG Partners/Baniyas_Club_logo.png',
    'assets/images/Amyal PNG Partners/brand.png',
    'assets/images/Amyal PNG Partners/bawabat-alsharq-mall-logo.png',
    'assets/images/Amyal PNG Partners/cropped-logo-2021-1-1.png',
    'assets/images/Amyal PNG Partners/MOET_Horizontal_RGB_A.png',
    'assets/images/Amyal PNG Partners/umex-simtex-idc-2026-white--png.png',
    'assets/images/Amyal PNG Partners/dubai-sports-council-thumb.png'
  ];

  constructor(public langService: LanguageService) {
    // Watch for language changes and restart typing animation
    this.languageEffect = effect(() => {
      const translations = this.langService.translations();
      const currentLang = this.langService.currentLang();

      // Restart typing animation when language changes
      if (translations) {
        setTimeout(() => {
          this.startTypingAnimation();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.isLoaded.set(true), 100);
    this.initScrollAnimations();
    this.animateOnLoad();
    // Start typing animation after a delay
    setTimeout(() => {
      this.startTypingAnimation();
    }, 500);
  }

  private startTypingAnimation(): void {
    this.typedTitle.set('');
    this.isTyping.set(true);

    const translationKey = 'partners.title';
    let fullTitle = this.langService.t(translationKey);

    // Check if translation exists
    if (!fullTitle || fullTitle === translationKey) {
      setTimeout(() => {
        fullTitle = this.langService.t(translationKey);
        if (fullTitle && fullTitle !== translationKey) {
          this.typeText(fullTitle);
        } else {
          this.typedTitle.set(fullTitle || 'Our Partners');
          this.isTyping.set(false);
        }
      }, 200);
      return;
    }

    this.typeText(fullTitle);
  }

  private typeText(fullTitle: string): void {
    let currentIndex = 0;
    let timeoutId: any = null;

    const typeCharacter = () => {
      if (currentIndex < fullTitle.length) {
        this.typedTitle.set(fullTitle.substring(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(typeCharacter, 80);
        this.typingTimeout = timeoutId;
      } else {
        this.isTyping.set(false);
        this.typingTimeout = null;
      }
    };

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => typeCharacter(), 300);
  }

  ngOnDestroy(): void {
    if (this.languageEffect) {
      this.languageEffect.destroy();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
  }

  animateOnLoad(): void {
    setTimeout(() => {
      const fadeElements = document.querySelectorAll('.fade-in-up');
      fadeElements.forEach((element: Element, index: number) => {
        setTimeout(() => {
          (element as HTMLElement).style.opacity = '1';
          (element as HTMLElement).style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 200);
  }

  initScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          this.scrollObserver?.unobserve(entry.target);
        }
      });
    }, observerOptions);

    setTimeout(() => {
      const revealElements = document.querySelectorAll('.scroll-reveal');
      revealElements.forEach(element => this.scrollObserver?.observe(element));
    }, 300);
  }
}
