import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { ShimmerLoader } from '../shimmer-loader/shimmer-loader';

@Component({
  selector: 'app-partners',
  imports: [CommonModule, ShimmerLoader],
  templateUrl: './partners.html',
  styleUrl: './partners.css'
})
export class Partners implements OnInit, OnDestroy {
  isLoaded = signal(false);
  titleFadeState = signal<'fade-out' | 'fade-in' | 'visible'>('fade-out');
  private scrollObserver?: IntersectionObserver;
  private fadeTimeout: any = null;
  private languageEffect: any = null;

  // Partner images array
  partners = [
    'assets/images/Amyal PNG Partners/573521118_18541182556065137_6745484161360848157_n-Photoroom.png',
    'assets/images/Amyal PNG Partners/ADSB.png-Photoroom.png',
    'assets/images/Amyal PNG Partners/baniyas-sc-seeklogo.png',
    'assets/images/Amyal PNG Partners/bawabat-alsharq-mall-logo.png',
    'assets/images/Amyal PNG Partners/brand.png',
    'assets/images/Amyal PNG Partners/craiyon.png',
    'assets/images/Amyal PNG Partners/dubai-sports-council-thumb.png',
    'assets/images/Amyal PNG Partners/emirates center for strategic studies and research.png',
    'assets/images/Amyal PNG Partners/logo-en.png',
    'assets/images/Amyal PNG Partners/Makani.png',
    'assets/images/Amyal PNG Partners/Ministry-of-Human-Resources-&-Emiratisation-.png',
    'assets/images/Amyal PNG Partners/MOCCAE_Horizontal-en.png',
    'assets/images/Amyal PNG Partners/MOET_Horizontal_RGB_A.png',
    'assets/images/Amyal PNG Partners/SAAS properties.png',
    'assets/images/Amyal PNG Partners/umex_and_simtex.png'
  ];

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
    // Simulate loading time to show shimmer effect
    setTimeout(() => this.isLoaded.set(true), 1500);
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

  openImage(imageSrc: string): void {
    // Open image in a new window/tab without any effects
    if (imageSrc) {
      window.open(imageSrc, '_blank');
    }
  }
}
