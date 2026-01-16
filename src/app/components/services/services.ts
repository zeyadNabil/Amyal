import { Component, OnInit, OnDestroy, AfterViewInit, signal, effect, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-services',
  imports: [CommonModule, RouterModule],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services implements OnInit, OnDestroy, AfterViewInit {
  serviceType = signal<string>('');
  isLoaded = signal(false);
  currentSlideIndex = signal(0);
  typedTitle = signal<string>('');
  isTyping = signal<boolean>(false);
  private typingTimeout: any = null;
  private languageEffect: any = null;
  private previousLang: string = '';

  @ViewChild('carousel', { static: false }) carouselElement!: ElementRef;
  private carousel: any = null;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private minSwipeDistance: number = 50;

  // Service types mapping
  serviceTypes: { [key: string]: string } = {
    'exhibition-stand': 'exhibitionStand',
    'exhibition-booth-design': 'exhibitionBoothDesign',
    'display-units-mall-kiosk': 'displayUnitsMallKiosk',
    'event-management': 'eventManagement',
    'brand-ambassadors-event-hosts': 'brandAmbassadorsEventHosts',
    'av-service': 'avService',
    'vehicle-branding-wrapping': 'vehicleBrandingWrapping',
    'stickers-custom-prints': 'stickersCustomPrints',
    'fabrication-manufacturing': 'fabricationManufacturing'
  };

  // Image URLs for each service (using Unsplash placeholder images) - 3 different images per service
  serviceImages: { [key: string]: string[] } = {
    'exhibition-stand': [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop'
    ],
    'exhibition-booth-design': [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop'
    ],
    'display-units-mall-kiosk': [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=800&fit=crop'
    ],
    'event-management': [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop'
    ],
    'brand-ambassadors-event-hosts': [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop'
    ],
    'av-service': [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop'
    ],
    'vehicle-branding-wrapping': [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop'
    ],
    'stickers-custom-prints': [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop'
    ],
    'fabrication-manufacturing': [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop'
    ]
  };

  constructor(
    private route: ActivatedRoute,
    public langService: LanguageService
  ) {
    // Store initial language
    this.previousLang = this.langService.currentLang();

    // Watch for language changes and restart typing animation
    this.languageEffect = effect(() => {
      // Read the translations signal to react to changes
      const translations = this.langService.translations();
      const currentLang = this.langService.currentLang();

      // Only restart if component is loaded, translations exist, language actually changed, and service key exists
      if (this.isLoaded() && translations && this.getServiceKey() && currentLang !== this.previousLang) {
        this.previousLang = currentLang;

        // Clear any ongoing typing animation
        if (this.typingTimeout) {
          clearTimeout(this.typingTimeout);
        }

        // Reset typing state
        this.typedTitle.set('');
        this.isTyping.set(false);

        // Restart typing animation with new translation
        setTimeout(() => {
          this.startTypingAnimation();
        }, 150);
      } else if (!this.previousLang) {
        // Set initial language on first load
        this.previousLang = currentLang;
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const serviceId = params['id'] || '';

      // Reset typing state when route changes
      this.typedTitle.set('');
      this.isTyping.set(false);

      this.serviceType.set(serviceId);
      this.isLoaded.set(true);

      // Wait a bit to ensure translation is loaded, then start typing
      setTimeout(() => {
        this.startTypingAnimation();
      }, 150);

      setTimeout(() => {
        this.initScrollAnimations();
        this.initCarouselDrag();
      }, 100);
    });
  }

  ngAfterViewInit(): void {
    // Initialize carousel drag after view is initialized
    setTimeout(() => {
      this.initCarouselDrag();
    }, 300);
  }

  private initCarouselDrag(): void {
    const carouselEl = document.getElementById('serviceCarousel');
    if (!carouselEl) return;

    // Try to get Bootstrap carousel instance
    try {
      // Check if Bootstrap is available
      if ((window as any).bootstrap) {
        this.carousel = (window as any).bootstrap.Carousel.getInstance(carouselEl);
        if (!this.carousel) {
          // Initialize if not already initialized
          this.carousel = new (window as any).bootstrap.Carousel(carouselEl);
        }
      }
    } catch (e) {
      console.log('Bootstrap carousel API not available, using fallback');
    }

    // Touch events for mobile
    carouselEl.addEventListener('touchstart', (e: TouchEvent) => {
      this.touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carouselEl.addEventListener('touchend', (e: TouchEvent) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.handleSwipe();
    }, { passive: true });

    // Mouse events for desktop drag
    let isMouseDown = false;
    let mouseStartX = 0;
    let mouseEndX = 0;
    let hasDragged = false;

    const handleMouseDown = (e: MouseEvent) => {
      // Don't interfere with button clicks or links
      const target = e.target as HTMLElement;
      if (target.closest('.carousel-control-prev') ||
          target.closest('.carousel-control-next') ||
          target.closest('.carousel-indicators') ||
          target.closest('a') ||
          target.closest('button')) {
        return;
      }

      e.preventDefault();
      isMouseDown = true;
      hasDragged = false;
      mouseStartX = e.clientX;
      mouseEndX = e.clientX;
      carouselEl.style.cursor = 'grabbing';
      carouselEl.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDown) {
        e.preventDefault();
        mouseEndX = e.clientX;
        const diff = mouseStartX - mouseEndX;

        // Visual feedback during drag
        if (Math.abs(diff) > 10) {
          hasDragged = true;
        }
      }
    };

    const handleMouseUp = () => {
      if (isMouseDown) {
        const diff = mouseStartX - mouseEndX;

        // Only trigger slide if there was actual drag movement
        if (hasDragged && Math.abs(diff) > this.minSwipeDistance) {
          if (diff > 0) {
            // Dragged left - next slide
            this.goToNextSlide();
          } else {
            // Dragged right - previous slide
            this.goToPrevSlide();
          }
        }

        isMouseDown = false;
        hasDragged = false;
        carouselEl.style.cursor = 'grab';
        carouselEl.style.userSelect = '';
      }
    };

    const handleMouseLeave = () => {
      if (isMouseDown) {
        // If mouse leaves while dragging, still check if we should slide
        handleMouseUp();
      }
    };

    carouselEl.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    carouselEl.addEventListener('mouseleave', handleMouseLeave);

    // Set initial cursor
    carouselEl.style.cursor = 'grab';
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) > this.minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next slide
        this.goToNextSlide();
      } else {
        // Swipe right - previous slide
        this.goToPrevSlide();
      }
    }
  }

  private goToNextSlide(): void {
    const carouselEl = document.getElementById('serviceCarousel');
    if (!carouselEl) return;

    if (this.carousel && typeof this.carousel.next === 'function') {
      this.carousel.next();
    } else {
      // Fallback: trigger next button click
      const nextButton = carouselEl.querySelector('.carousel-control-next') as HTMLElement;
      if (nextButton) {
        nextButton.click();
      }
    }
  }

  private goToPrevSlide(): void {
    const carouselEl = document.getElementById('serviceCarousel');
    if (!carouselEl) return;

    if (this.carousel && typeof this.carousel.prev === 'function') {
      this.carousel.prev();
    } else {
      // Fallback: trigger prev button click
      const prevButton = carouselEl.querySelector('.carousel-control-prev') as HTMLElement;
      if (prevButton) {
        prevButton.click();
      }
    }
  }

  private startTypingAnimation(): void {
    this.typedTitle.set('');
    this.isTyping.set(true);

    const serviceKey = this.getServiceKey();
    if (!serviceKey) {
      // If service key is not available, fallback to showing full title
      const fallbackTitle = this.langService.t('nav.' + this.serviceType());
      this.typedTitle.set(fallbackTitle);
      this.isTyping.set(false);
      return;
    }

    const translationKey = 'nav.' + serviceKey;
    let fullTitle = this.langService.t(translationKey);

    // Check if translation exists (not just the key itself)
    if (!fullTitle || fullTitle === translationKey) {
      // Translation not ready yet, try again after a delay
      setTimeout(() => {
        fullTitle = this.langService.t(translationKey);
        if (fullTitle && fullTitle !== translationKey) {
          this.typeText(fullTitle);
        } else {
          // Still not ready, show what we have
          this.typedTitle.set(fullTitle || this.serviceType());
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
        timeoutId = setTimeout(typeCharacter, 80); // Adjust speed here (milliseconds per character)
        this.typingTimeout = timeoutId;
      } else {
        this.isTyping.set(false);
        this.typingTimeout = null;
      }
    };

    // Clear any existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Start typing after a short delay
    this.typingTimeout = setTimeout(() => typeCharacter(), 300);
  }

  ngOnDestroy(): void {
    // Clean up effect
    if (this.languageEffect) {
      this.languageEffect.destroy();
    }

    // Clear any ongoing typing animation
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  getServiceKey(): string {
    const type = this.serviceType();
    return this.serviceTypes[type] || '';
  }

  // Get translated content from services section
  getTranslation(key: string): string {
    const serviceKey = this.getServiceKey();
    return this.langService.t(`services.${serviceKey}.${key}`);
  }

  getOverview(): string {
    return this.getTranslation('overview');
  }

  getFeatures(): string[] {
    const serviceKey = this.getServiceKey();
    const featuresStr = this.langService.t(`services.${serviceKey}.features`);
    if (featuresStr && featuresStr !== `services.${serviceKey}.features`) {
      return featuresStr.split('|').filter(f => f.trim());
    }
    return [];
  }

  getBenefits(): string[] {
    const serviceKey = this.getServiceKey();
    const benefitsStr = this.langService.t(`services.${serviceKey}.benefits`);
    if (benefitsStr && benefitsStr !== `services.${serviceKey}.benefits`) {
      return benefitsStr.split('|').filter(b => b.trim());
    }
    return [];
  }

  getWhatMakesDifferent(): string[] {
    const serviceKey = this.getServiceKey();
    const differentStr = this.langService.t(`services.${serviceKey}.whatMakesDifferent`);
    if (differentStr && differentStr !== `services.${serviceKey}.whatMakesDifferent`) {
      return differentStr.split('|').filter(d => d.trim());
    }
    return [];
  }

  getWhatWeDeliver(): string[] {
    const serviceKey = this.getServiceKey();
    const deliverStr = this.langService.t(`services.${serviceKey}.whatWeDeliver`);
    if (deliverStr && deliverStr !== `services.${serviceKey}.whatWeDeliver`) {
      return deliverStr.split('|').filter(d => d.trim());
    }
    return [];
  }

  getWhyChoose(): string[] {
    const serviceKey = this.getServiceKey();
    const whyStr = this.langService.t(`services.${serviceKey}.whyChoose`);
    if (whyStr && whyStr !== `services.${serviceKey}.whyChoose`) {
      return whyStr.split('|').filter(w => w.trim());
    }
    return [];
  }

  getClosingText(): string {
    return this.getTranslation('closingText');
  }

  getServiceImages(): string[] {
    const key = this.serviceType();
    return this.serviceImages[key] || [];
  }

  // Icon arrays for different sections
  private featureIcons: string[] = [
    'fa-check-circle',
    'fa-star',
    'fa-lightbulb',
    'fa-cog',
    'fa-rocket',
    'fa-trophy',
    'fa-shield-alt',
    'fa-users',
    'fa-chart-line',
    'fa-bolt'
  ];

  private benefitIcons: string[] = [
    'fa-heart',
    'fa-thumbs-up',
    'fa-gift',
    'fa-medal',
    'fa-smile',
    'fa-award',
    'fa-gem',
    'fa-fire',
    'fa-magic',
    'fa-infinity'
  ];

  private differentIcons: string[] = [
    'fa-star',
    'fa-crown',
    'fa-diamond',
    'fa-bolt',
    'fa-flash',
    'fa-gem',
    'fa-fire',
    'fa-sun',
    'fa-moon',
    'fa-meteor'
  ];

  private deliverIcons: string[] = [
    'fa-check-circle',
    'fa-check-double',
    'fa-check-square',
    'fa-hand-holding',
    'fa-gift',
    'fa-box-open',
    'fa-shipping-fast',
    'fa-clipboard-check'
  ];

  private chooseIcons: string[] = [
    'fa-heart',
    'fa-thumbs-up',
    'fa-star',
    'fa-crown',
    'fa-award',
    'fa-trophy',
    'fa-medal',
    'fa-gem'
  ];

  // Methods to get icons based on index
  getFeatureIcon(index: number): string {
    return this.featureIcons[index % this.featureIcons.length];
  }

  getBenefitIcon(index: number): string {
    return this.benefitIcons[index % this.benefitIcons.length];
  }

  getDifferentIcon(index: number): string {
    return this.differentIcons[index % this.differentIcons.length];
  }

  getDeliverIcon(index: number): string {
    return this.deliverIcons[index % this.deliverIcons.length];
  }

  getChooseIcon(index: number): string {
    return this.chooseIcons[index % this.chooseIcons.length];
  }

  hasContent(): boolean {
    const overview = this.getOverview();
    const serviceKey = this.getServiceKey();
    const expectedKey = `services.${serviceKey}.overview`;

    // Check if overview exists and is not the key itself
    if (overview && overview !== expectedKey && !overview.startsWith('services.')) {
      return true;
    }

    // Check if any other content exists
    return this.getFeatures().length > 0 ||
           this.getBenefits().length > 0 ||
           this.getWhatMakesDifferent().length > 0 ||
           this.getWhatWeDeliver().length > 0 ||
           this.getWhyChoose().length > 0;
  }

  nextSlide(total: number): void {
    const current = this.currentSlideIndex();
    this.currentSlideIndex.set((current + 1) % total);
  }

  prevSlide(total: number): void {
    const current = this.currentSlideIndex();
    this.currentSlideIndex.set(current === 0 ? total - 1 : current - 1);
  }

  goToSlide(index: number): void {
    this.currentSlideIndex.set(index);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.checkScrollReveal();
  }

  private initScrollAnimations(): void {
    setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    }, 100);
  }

  private checkScrollReveal(): void {
    const elements = document.querySelectorAll('.scroll-reveal:not(.active)');
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) {
        element.classList.add('active');
      }
    });
  }
}
