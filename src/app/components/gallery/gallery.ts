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
  titleFadeState = signal<'fade-out' | 'fade-in' | 'visible'>('fade-out');
  private scrollObserver?: IntersectionObserver;
  private imageObserver?: IntersectionObserver;
  private fadeTimeout: any = null;
  private languageEffect: any = null;
  private keyDownHandler: ((event: KeyboardEvent) => void) | null = null;

  // Lightbox state
  isLightboxOpen = signal(false);
  currentImageIndex = signal(0);
  
  // All gallery images in order
  galleryImages = [
    'assets/images/gallery/frame_30.jpg',
    'assets/images/gallery/frame_31.jpg',
    'assets/images/gallery/frame_32.jpg',
    'assets/images/gallery/frame_33.jpg',
    'assets/images/gallery/frame_34.jpg',
    'assets/images/gallery/frame_35.jpg',
    'assets/images/gallery/frame_36.jpg',
    'assets/images/gallery/mahawa_1.jpg',
    'assets/images/gallery/mahawa_2.jpg',
    'assets/images/gallery/mahawa_3.jpg',
    'assets/images/gallery/mahawa_4.jpg',
    'assets/images/gallery/mahawa_5.jpg',
    'assets/images/gallery/mahawa_6.jpg',
    'assets/images/gallery/mahawa_7.jpg',
    'assets/images/gallery/mahawa_8.jpg',
    'assets/images/gallery/mahawa_9.jpg',
    'assets/images/gallery/mahawa_10.jpg',
    'assets/images/gallery/mahawa_11.jpg',
    'assets/images/gallery/mahawa_12.jpg',
    'assets/images/gallery/mahawa_13.jpg',
    'assets/images/gallery/mahawa_14.jpg',
    'assets/images/gallery/54eid_etihad.jpg',
    'assets/images/gallery/54uae.jpg',
    'assets/images/gallery/adcoap.jpg'
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
    setTimeout(() => this.isLoaded.set(true), 100);
    this.initScrollAnimations();
    this.initImageAnimations();
    this.animateOnLoad();
    // Start fade animation after a delay
    setTimeout(() => {
      this.startFadeAnimation();
    }, 500);
    
    // Add keyboard navigation for lightbox
    this.keyDownHandler = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.keyDownHandler);
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
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
    // Remove keyboard listener
    if (this.keyDownHandler) {
      document.removeEventListener('keydown', this.keyDownHandler);
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

  openImage(imageSrc: string): void {
    // Find the index of the clicked image
    const index = this.galleryImages.indexOf(imageSrc);
    if (index !== -1) {
      this.currentImageIndex.set(index);
      this.isLightboxOpen.set(true);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
      // Hide navbar, back-to-top button, and chat widget when lightbox is open
      const navbar = document.getElementById('mainNav');
      const backToTop = document.querySelector('.back-to-top-btn') as HTMLElement;
      const chatWidget = document.querySelector('.chat-widget-container') as HTMLElement;
      
      if (navbar) {
        navbar.style.display = 'none';
      }
      if (backToTop) {
        backToTop.style.display = 'none';
      }
      if (chatWidget) {
        chatWidget.style.display = 'none';
      }
    }
  }

  closeLightbox(): void {
    this.isLightboxOpen.set(false);
    document.body.style.overflow = '';
    // Show navbar, back-to-top button, and chat widget again when lightbox is closed
    const navbar = document.getElementById('mainNav');
    const backToTop = document.querySelector('.back-to-top-btn') as HTMLElement;
    const chatWidget = document.querySelector('.chat-widget-container') as HTMLElement;
    
    if (navbar) {
      navbar.style.display = '';
    }
    if (backToTop) {
      backToTop.style.display = '';
    }
    if (chatWidget) {
      chatWidget.style.display = '';
    }
  }

  nextImage(): void {
    const currentIndex = this.currentImageIndex();
    const nextIndex = (currentIndex + 1) % this.galleryImages.length;
    this.currentImageIndex.set(nextIndex);
  }

  prevImage(): void {
    const currentIndex = this.currentImageIndex();
    const prevIndex = currentIndex === 0 ? this.galleryImages.length - 1 : currentIndex - 1;
    this.currentImageIndex.set(prevIndex);
  }

  getCurrentImage(): string {
    return this.galleryImages[this.currentImageIndex()];
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isLightboxOpen()) return;

    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
      case 'ArrowLeft':
        this.prevImage();
        break;
    }
  }
}
