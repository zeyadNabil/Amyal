import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { PARTNER_IMAGES } from '../../constants/partner-images.constant';

@Component({
  selector: 'app-partners',
  imports: [CommonModule],
  templateUrl: './partners.html',
  styleUrl: './partners.css'
})
export class Partners implements OnInit, OnDestroy {
  isLoaded = signal(false);
  titleFadeState = signal<'fade-out' | 'fade-in' | 'visible'>('fade-out');
  private scrollObserver?: IntersectionObserver;
  private fadeTimeout: any = null;
  private languageEffect: any = null;

  // Partner images array - loaded from constant file
  get partners(): string[] {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return isMobile ? PARTNER_IMAGES.partnersPage.slice(0, 48) : PARTNER_IMAGES.partnersPage;
  }

  constructor(public langService: LanguageService) {
    // Watch for language changes and restart fade animation
    this.languageEffect = effect(() => {
      const translations = this.langService.translations();
      const currentLang = this.langService.currentLang();

      // Restart fade animation when language changes
      if (translations) {
        setTimeout(() => {
          this.startFadeAnimation();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    // Load content immediately
    this.isLoaded.set(true);
    this.initScrollAnimations();
    this.animateOnLoad();
    // Start fade animation after a delay
    setTimeout(() => {
      this.startFadeAnimation();
    }, 500);
  }

  private startFadeAnimation(): void {
    // Fade out first
    this.titleFadeState.set('fade-out');

    // After fade out completes, fade in
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }

    this.fadeTimeout = setTimeout(() => {
      this.titleFadeState.set('fade-in');
      // After fade in completes, set to visible
      this.fadeTimeout = setTimeout(() => {
        this.titleFadeState.set('visible');
      }, 800);
    }, 400);
  }

  ngOnDestroy(): void {
    if (this.languageEffect) {
      this.languageEffect.destroy();
    }
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
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
      rootMargin: '0px 0px -150px 0px'
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

  openImage(imageSrc: string): void {
    // Open image in a new window/tab without any effects
    if (imageSrc) {
      window.open(imageSrc, '_blank');
    }
  }
}
