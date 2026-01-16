import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery implements OnInit, OnDestroy {
  isLoaded = signal(false);
  typedTitle = signal<string>('');
  isTyping = signal<boolean>(false);
  private scrollObserver?: IntersectionObserver;
  private imageObserver?: IntersectionObserver;
  private typingTimeout: any = null;
  private languageEffect: any = null;

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
    this.initImageAnimations();
    this.animateOnLoad();
    // Start typing animation after a delay
    setTimeout(() => {
      this.startTypingAnimation();
    }, 500);
  }

  private startTypingAnimation(): void {
    this.typedTitle.set('');
    this.isTyping.set(true);

    const translationKey = 'gallery.title';
    let fullTitle = this.langService.t(translationKey);

    // Check if translation exists
    if (!fullTitle || fullTitle === translationKey) {
      setTimeout(() => {
        fullTitle = this.langService.t(translationKey);
        if (fullTitle && fullTitle !== translationKey) {
          this.typeText(fullTitle);
        } else {
          this.typedTitle.set(fullTitle || 'Gallery');
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
    if (this.imageObserver) {
      this.imageObserver.disconnect();
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

  initImageAnimations(): void {
    const imageObserverOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    };

    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('image-loaded');
          this.imageObserver?.unobserve(entry.target);
        }
      });
    }, imageObserverOptions);

    setTimeout(() => {
      const imageContainers = document.querySelectorAll('.gallery-image');
      imageContainers.forEach(container => this.imageObserver?.observe(container));
    }, 300);
  }
}
