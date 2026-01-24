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
  titleFadeState = signal<'fade-out' | 'fade-in' | 'visible'>('fade-out');
  private fadeTimeout: any = null;
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
    'mall-activation': 'mallActivation',
    'brand-ambassadors-event-hosts': 'brandAmbassadorsEventHosts',
    'av-service': 'avService',
    'vehicle-branding-wrapping': 'vehicleBrandingWrapping',
    'stickers-custom-prints': 'stickersCustomPrints',
    'fabrication-manufacturing': 'fabricationManufacturing'
  };

  // Image URLs for each service (using local gallery images) - 3 different images per service
  serviceImages: { [key: string]: string[] } = {
    'exhibition-stand': [
      'assets/images/gallery/frame_5.jpg',
      'assets/images/gallery/frame_6.jpg',
      'assets/images/gallery/frame_7.jpg'
    ],
    'exhibition-booth-design': [
      'assets/images/sign board/jetour.jpeg',
      'assets/images/sign board/neon signage.jpeg',
      'assets/images/sign board/stainless steel.jpeg'
    ],
    'display-units-mall-kiosk': [
      'assets/images/gallery/frame_8.jpg',
      'assets/images/gallery/frame_9.jpg',
      'assets/images/gallery/frame_10.jpg'
    ],
    'event-management': [
      'assets/images/gallery/frame_11.jpg',
      'assets/images/gallery/frame_12.jpg',
      'assets/images/gallery/frame_13.jpg'
    ],
    'mall-activation': [
      'assets/images/gallery/frame_14.jpg'
    ],
    'brand-ambassadors-event-hosts': [
      'assets/images/gallery/frame_15.jpg',
      'assets/images/gallery/frame_16.jpg',
      'assets/images/gallery/frame_17.jpg'
    ],
    'av-service': [
      'assets/images/gallery/frame_18.jpg',
      'assets/images/gallery/frame_19.jpg',
      'assets/images/gallery/frame_20.jpg'
    ],
    'vehicle-branding-wrapping': [
      'assets/images/gallery/frame_21.jpg',
      'assets/images/gallery/frame_22.jpg',
      'assets/images/gallery/frame_23.jpg'
    ],
    'stickers-custom-prints': [
      'assets/images/gallery/frame_24.jpg',
      'assets/images/gallery/frame_25.jpg',
      'assets/images/gallery/frame_26.jpg'
    ],
    'fabrication-manufacturing': [
      'assets/images/gallery/frame_27.jpg',
      'assets/images/gallery/frame_28.jpg',
      'assets/images/gallery/frame_29.jpg'
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

        // Clear any ongoing fade animation
        if (this.fadeTimeout) {
          clearTimeout(this.fadeTimeout);
        }

        // Restart fade animation with new translation
        setTimeout(() => {
          this.startFadeAnimation();
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

      // Reset fade state when route changes
      this.titleFadeState.set('fade-out');

      this.serviceType.set(serviceId);
      this.isLoaded.set(true);

      // Wait a bit to ensure translation is loaded, then start fade
      setTimeout(() => {
        this.startFadeAnimation();
      }, 150);

      setTimeout(() => {
        this.initScrollAnimations();
        this.initCarouselDrag();
        
        // Ensure video is muted if it's Mall Activation
        if (serviceId === 'mall-activation') {
          this.enforceVideoMuted();
        }
      }, 100);
    });
  }

  ngAfterViewInit(): void {
    // Initialize carousel drag after view is initialized
    setTimeout(() => {
      this.initCarouselDrag();
      
      // Ensure video is muted for Mall Activation
      if (this.isMallActivation()) {
        this.enforceVideoMuted();
      }
    }, 300);
  }

  private enforceVideoMuted(): void {
    const videoElement = document.querySelector('.service-video') as HTMLVideoElement;
    if (!videoElement) {
      // Retry if video not loaded yet
      setTimeout(() => this.enforceVideoMuted(), 100);
      return;
    }

    // Set muted immediately
    videoElement.muted = true;
    videoElement.volume = 0;
    videoElement.setAttribute('muted', 'true');
    videoElement.removeAttribute('controls');

    // Function to force mute
    const forceMute = () => {
      if (videoElement) {
        videoElement.muted = true;
        videoElement.volume = 0;
        videoElement.setAttribute('muted', 'true');
      }
    };

    // Multiple event listeners to catch any unmuting attempts
    videoElement.addEventListener('volumechange', forceMute, { passive: true });
    videoElement.addEventListener('play', forceMute, { passive: true });
    videoElement.addEventListener('loadedmetadata', forceMute, { passive: true });
    videoElement.addEventListener('loadeddata', forceMute, { passive: true });
    videoElement.addEventListener('canplay', forceMute, { passive: true });
    videoElement.addEventListener('playing', forceMute, { passive: true });

    // Watch for attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'muted') {
          if (!videoElement.muted) {
            forceMute();
          }
        }
      });
    });

    observer.observe(videoElement, {
      attributes: true,
      attributeFilter: ['muted', 'volume']
    });

    // Periodic check to ensure it stays muted
    const muteInterval = setInterval(() => {
      if (videoElement && (!videoElement.muted || videoElement.volume > 0)) {
        forceMute();
      }
    }, 500);

    // Clean up interval when component is destroyed
    window.addEventListener('beforeunload', () => {
      clearInterval(muteInterval);
      observer.disconnect();
    });
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
          // Initialize if not already initialized with 5 second interval
          this.carousel = new (window as any).bootstrap.Carousel(carouselEl, {
            interval: 5000,
            ride: 'carousel'
          });
        } else {
          // Update interval if carousel already exists
          this.carousel._config.interval = 5000;
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
    // Clean up effect
    if (this.languageEffect) {
      this.languageEffect.destroy();
    }

    // Clear any ongoing fade animation
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
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

  isMallActivation(): boolean {
    return this.serviceType() === 'mall-activation';
  }

  isSignBoard(): boolean {
    return this.serviceType() === 'exhibition-booth-design';
  }

  // Feature images for Sign Board service
  signBoardFeatureImages: { [key: number]: string } = {
    0: 'assets/images/sign board/all.jpeg', // 3D Signage
    1: 'assets/images/sign board/sou=ast_light.jpeg', // Outdoor Flex Face Signage
    2: 'assets/images/sign board/jetour_indoor.jpeg', // Indoor & Reception Signage
    3: 'assets/images/sign board/eliteGroup.jpeg', // Office & Door Signage
    4: 'assets/images/sign board/aluminuim&bras.jpeg', // Aluminium & Brass 3D Signage
    5: 'assets/images/sign board/stainless steel.jpeg', // Stainless Steel Signage
    6: 'assets/images/sign board/neon signage.jpeg', // Neon & LED Signage
    7: 'assets/images/sign board/sou=ast.jpeg', // Wall & Glass Stickers
    8: 'assets/images/sign board/jetour.jpeg', // Digital Printing & Promotional Graphics
    9: 'assets/images/sign board/all.jpeg' // Vehicle Branding (fallback)
  };

  getFeatureImage(index: number): string | null {
    if (this.isSignBoard() && this.signBoardFeatureImages[index]) {
      return this.signBoardFeatureImages[index];
    }
    return null;
  }

  getMallActivationVideoUrl(): string {
    return 'assets/images/mall_activation_video.mp4';
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

  // Methods to get icons based on index (language-independent)
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
