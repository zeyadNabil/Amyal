import { Component, OnInit, OnDestroy, AfterViewInit, signal, effect, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { SERVICE_IMAGES } from '../../constants/service-images.constant';
import { ShimmerLoader } from '../shimmer-loader/shimmer-loader';

// Add FontAwesome icons if not already imported

@Component({
  selector: 'app-services',
  imports: [CommonModule, RouterModule, ShimmerLoader],
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
  @ViewChild('cardSlider', { static: false }) cardSliderElement!: ElementRef;
  private carousel: any = null;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private minSwipeDistance: number = 50;

  // Card slider state
  sliderOffset = signal(0);
  isDragging = signal(false);
  dragStartX = signal(0);
  dragCurrentX = signal(0);
  currentCardIndex = signal(0);
  cardsVisible = signal(3);
  private cardWidth: number = 0;
  private gap: number = 30;
  private keyDownHandler: ((event: KeyboardEvent) => void) | null = null;
  private popStateHandler: ((event: PopStateEvent) => void) | null = null;

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

  // Image URLs for each service (using shared constant)
  serviceImages: { [key: string]: string[] } = SERVICE_IMAGES;

  constructor(
    private route: ActivatedRoute,
    public langService: LanguageService,
    private location: Location
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
      this.isLoaded.set(false);

      this.serviceType.set(serviceId);

      // Simulate loading time to show shimmer effect
      setTimeout(() => this.isLoaded.set(true), 1500);

      // Wait a bit to ensure translation is loaded, then start fade
      setTimeout(() => {
        this.startFadeAnimation();
      }, 150);

      setTimeout(() => {
        this.initScrollAnimations();
        this.initCardSlider();

        // Ensure video is muted if it has video
        if (serviceId === 'mall-activation' || serviceId === 'av-service') {
          this.enforceVideoMuted();
        }
      }, 100);
    });

    // Add keyboard navigation for slider lightbox
    this.keyDownHandler = this.handleKeyDown.bind(this);
    if (this.keyDownHandler) {
      document.addEventListener('keydown', this.keyDownHandler);
    }

    // Add popstate handler for browser back button
    this.popStateHandler = this.handlePopState.bind(this);
    window.addEventListener('popstate', this.popStateHandler);
  }

  ngAfterViewInit(): void {
    // Initialize card slider after view is initialized
    setTimeout(() => {
      this.initCardSlider();

      // Ensure video is muted for services with video
      if (this.hasVideo()) {
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

  private initCardSlider(): void {
    setTimeout(() => {
      if (this.cardSliderElement?.nativeElement) {
        const container = this.cardSliderElement.nativeElement;
        const containerWidth = container.offsetWidth;

        // Determine cards visible and gap based on screen size
        let cardsVisible = 3;
        if (window.innerWidth <= 576) {
          cardsVisible = 1;
          this.gap = 15;
        } else if (window.innerWidth <= 768) {
          cardsVisible = 2;
          this.gap = 20;
        } else {
          cardsVisible = 3;
          this.gap = 30;
        }
        this.cardsVisible.set(cardsVisible);

        // Calculate card width based on container and gap
        this.cardWidth = (containerWidth - (this.gap * (cardsVisible - 1))) / cardsVisible;

        // Reset to first card if current index is out of bounds
        const maxIndex = Math.max(0, this.getServiceImages().length - cardsVisible);
        if (this.currentCardIndex() > maxIndex) {
          this.currentCardIndex.set(0);
        }

        this.updateSliderPosition();
      }
    }, 100);
  }

  // Mouse drag handlers
  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.slider-nav-btn') || target.closest('button')) {
      return;
    }

    event.preventDefault();
    this.isDragging.set(true);
    this.dragStartX.set(event.clientX);
    this.dragCurrentX.set(event.clientX);

    if (this.cardSliderElement?.nativeElement) {
      this.cardSliderElement.nativeElement.style.cursor = 'grabbing';
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) return;

    event.preventDefault();
    this.dragCurrentX.set(event.clientX);
    const diff = this.dragStartX() - this.dragCurrentX();
    const newOffset = this.sliderOffset() - diff;

    // Calculate bounds
    const maxOffset = 0;
    const minOffset = -((this.getServiceImages().length - this.cardsVisible()) * (this.cardWidth + this.gap));

    // Clamp the offset
    const clampedOffset = Math.max(minOffset, Math.min(maxOffset, newOffset));
    this.sliderOffset.set(clampedOffset);
    this.dragStartX.set(this.dragCurrentX());
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.isDragging()) return;

    this.isDragging.set(false);

    if (this.cardSliderElement?.nativeElement) {
      this.cardSliderElement.nativeElement.style.cursor = 'grab';
    }

    // Snap to nearest card
    this.snapToNearestCard();
  }

  // Touch handlers
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.isDragging.set(true);
      this.dragStartX.set(event.touches[0].clientX);
      this.dragCurrentX.set(event.touches[0].clientX);
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging() || event.touches.length === 0) return;

    event.preventDefault();
    this.dragCurrentX.set(event.touches[0].clientX);
    const diff = this.dragStartX() - this.dragCurrentX();
    const newOffset = this.sliderOffset() - diff;

    // Calculate bounds
    const maxOffset = 0;
    const minOffset = -((this.getServiceImages().length - this.cardsVisible()) * (this.cardWidth + this.gap));

    // Clamp the offset
    const clampedOffset = Math.max(minOffset, Math.min(maxOffset, newOffset));
    this.sliderOffset.set(clampedOffset);
    this.dragStartX.set(this.dragCurrentX());
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isDragging()) return;

    this.isDragging.set(false);
    this.snapToNearestCard();
  }

  private snapToNearestCard(): void {
    const cardStep = this.cardWidth + this.gap;
    const currentIndex = Math.round(-this.sliderOffset() / cardStep);
    const maxIndex = Math.max(0, this.getServiceImages().length - this.cardsVisible());
    const clampedIndex = Math.max(0, Math.min(maxIndex, currentIndex));

    this.currentCardIndex.set(clampedIndex);
    this.sliderOffset.set(-clampedIndex * cardStep);
  }

  scrollCards(direction: 'prev' | 'next'): void {
    const cardStep = this.cardWidth + this.gap;
    const maxIndex = Math.max(0, this.getServiceImages().length - this.cardsVisible());

    if (direction === 'next') {
      const nextIndex = Math.min(maxIndex, this.currentCardIndex() + 1);
      this.currentCardIndex.set(nextIndex);
      this.sliderOffset.set(-nextIndex * cardStep);
    } else {
      const prevIndex = Math.max(0, this.currentCardIndex() - 1);
      this.currentCardIndex.set(prevIndex);
      this.sliderOffset.set(-prevIndex * cardStep);
    }
  }

  canScrollPrev(): boolean {
    return this.currentCardIndex() > 0;
  }

  canScrollNext(): boolean {
    const maxIndex = Math.max(0, this.getServiceImages().length - this.cardsVisible());
    return this.currentCardIndex() < maxIndex;
  }

  getCardsVisible(): number {
    return this.cardsVisible();
  }

  getCardText(index: number): string {
    const features = this.getFeatures();
    const serviceKey = this.getServiceKey();

    // If we have features, use them for card text
    if (features && features.length > index) {
      return features[index];
    }

    // Fallback: create descriptive text based on service and index
    const serviceName = this.langService.t('nav.' + serviceKey) || this.serviceType();
    const descriptions: { [key: string]: string[] } = {
      'exhibitionStand': [
        'Professional exhibition stands that showcase your brand with style and impact',
        'Custom-designed stands that attract visitors and create memorable experiences',
        'Innovative display solutions that maximize your exhibition presence'
      ],
      'exhibitionBoothDesign': [
        '3D Signage - Custom 3D letters and logos that make your brand stand out',
        'Outdoor Flex Face Signage - Large-format illuminated signs for building facades and storefronts',
        'Indoor & Reception Signage - Branded interior signs for lobbies, offices, and reception areas'
      ],
      'displayUnitsMallKiosk': [
        'Eye-catching display units that draw attention in high-traffic areas',
        'Custom kiosk designs perfect for malls and retail environments',
        'Interactive displays that engage customers and drive sales'
      ],
      'eventManagement': [
        'Complete event management services from planning to execution',
        'Professional event coordination ensuring seamless experiences',
        'Memorable events that leave lasting impressions on attendees'
      ],
      'brandAmbassadorsEventHosts': [
        'Professional brand ambassadors who represent your brand with excellence',
        'Experienced event hosts who engage and connect with your audience',
        'Dynamic personalities that bring your brand to life at events'
      ],
      'avService': [
        'State-of-the-art audio-visual equipment for impactful presentations',
        'Professional AV setup ensuring crystal-clear sound and visuals',
        'Complete AV solutions for events, conferences, and exhibitions'
      ],
      'vehicleBrandingWrapping': [
        'Full vehicle wrapping services that turn vehicles into mobile billboards',
        'High-quality vinyl wraps that protect and promote your brand',
        'Custom vehicle branding solutions for maximum visibility'
      ],
      'stickersCustomPrints': [
        'Custom stickers and prints for any application or surface',
        'High-quality printing services with vibrant colors and durability',
        'Personalized graphics that enhance your brand visibility'
      ],
      'fabricationManufacturing': [
        'Precision fabrication services for custom structures and displays',
        'Quality manufacturing ensuring durability and professional finish',
        'Expert craftsmanship bringing your design concepts to reality'
      ]
    };

    const serviceDescriptions = descriptions[serviceKey] || [];
    if (serviceDescriptions.length > index) {
      return serviceDescriptions[index];
    }

    // Final fallback
    return `${serviceName} - Premium quality service ${index + 1}`;
  }

  private updateSliderPosition(): void {
    const cardStep = this.cardWidth + this.gap;
    this.sliderOffset.set(-this.currentCardIndex() * cardStep);
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

    // Remove keyboard listener
    if (this.keyDownHandler) {
      document.removeEventListener('keydown', this.keyDownHandler);
    }

    // Remove popstate listener
    if (this.popStateHandler) {
      window.removeEventListener('popstate', this.popStateHandler);
    }

    // Clean up lightbox state if component is destroyed while lightbox is open
    // This handles cases like browser back button navigation away from services
    if (this.isSliderLightboxOpen()) {
      document.body.style.overflow = '';
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
    8: 'assets/images/sign board/jetour.jpeg' // Digital Printing & Promotional Graphics
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

  getAvServiceVideoUrl(): string {
    return 'assets/images/av_service.mp4';
  }

  isAvService(): boolean {
    return this.serviceType() === 'av-service';
  }

  hasVideo(): boolean {
    return this.isMallActivation() || this.isAvService();
  }

  getVideoUrl(): string {
    if (this.isMallActivation()) {
      return this.getMallActivationVideoUrl();
    } else if (this.isAvService()) {
      return this.getAvServiceVideoUrl();
    }
    return '';
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
    'fa-gem',
    'fa-bolt',
    'fa-rocket',
    'fa-gem',
    'fa-fire',
    'fa-sun',
    'fa-moon',
    'fa-certificate'
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

  @HostListener('window:resize', [])
  onResize(): void {
    this.initCardSlider();
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

  // Lightbox state for slider images
  isSliderLightboxOpen = signal(false);
  currentSliderImageIndex = signal(0);
  sliderImagesForLightbox: string[] = [];

  openImage(imageSrc: string): void {
    // For slider images, open in lightbox
    const sliderImages = this.getServiceImages();
    const index = sliderImages.indexOf(imageSrc);

    if (index !== -1 && sliderImages.length > 0) {
      // This is a slider image - open in lightbox
      this.sliderImagesForLightbox = sliderImages;
      this.currentSliderImageIndex.set(index);
      this.isSliderLightboxOpen.set(true);

      // Push a new state to browser history so back button closes lightbox
      history.pushState({ lightboxOpen: true }, '');

      document.body.style.overflow = 'hidden';

      // Hide navbar, back-to-top, and chat widget
      const navbar = document.getElementById('mainNav');
      const backToTop = document.querySelector('.back-to-top-btn') as HTMLElement;
      const chatWidget = document.querySelector('.chat-widget-container') as HTMLElement;

      if (navbar) navbar.style.display = 'none';
      if (backToTop) backToTop.style.display = 'none';
      if (chatWidget) chatWidget.style.display = 'none';
    } else {
      // For other images (overview section), open in new tab
      window.open(imageSrc, '_blank');
    }
  }

  closeSliderLightbox(skipHistoryBack: boolean = false): void {
    if (!this.isSliderLightboxOpen()) return;

    this.isSliderLightboxOpen.set(false);
    document.body.style.overflow = '';

    // Show navbar, back-to-top, and chat widget again
    const navbar = document.getElementById('mainNav');
    const backToTop = document.querySelector('.back-to-top-btn') as HTMLElement;
    const chatWidget = document.querySelector('.chat-widget-container') as HTMLElement;

    if (navbar) navbar.style.display = '';
    if (backToTop) backToTop.style.display = '';
    if (chatWidget) chatWidget.style.display = '';

    // If closing via X button (not back button), go back in history to remove the lightbox state
    if (!skipHistoryBack) {
      history.back();
    }
  }

  private handlePopState(event: PopStateEvent): void {
    // If lightbox is open and user presses back button, close the lightbox
    if (this.isSliderLightboxOpen()) {
      // Pass true to skip calling history.back() again (would cause double navigation)
      this.closeSliderLightbox(true);
    }
  }

  nextSliderImage(): void {
    const currentIndex = this.currentSliderImageIndex();
    const nextIndex = (currentIndex + 1) % this.sliderImagesForLightbox.length;
    this.currentSliderImageIndex.set(nextIndex);
  }

  prevSliderImage(): void {
    const currentIndex = this.currentSliderImageIndex();
    const prevIndex = currentIndex === 0 ? this.sliderImagesForLightbox.length - 1 : currentIndex - 1;
    this.currentSliderImageIndex.set(prevIndex);
  }

  getCurrentSliderImage(): string {
    return this.sliderImagesForLightbox[this.currentSliderImageIndex()] || '';
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isSliderLightboxOpen()) return;

    switch (event.key) {
      case 'Escape':
        this.closeSliderLightbox();
        break;
      case 'ArrowRight':
        this.nextSliderImage();
        break;
      case 'ArrowLeft':
        this.prevSliderImage();
        break;
    }
  }

  openImageInNewTab(imageSrc: string): void {
    if (imageSrc) {
      window.open(imageSrc, '_blank');
    }
  }
}
