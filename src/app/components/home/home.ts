import { Component, OnInit, OnDestroy, HostListener, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { ShimmerLoader } from '../shimmer-loader/shimmer-loader';
import { PARTNER_IMAGES } from '../../constants/partner-images.constant';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ShimmerLoader],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  isLoaded = signal(false);
  private counterTimers: Map<Element, { intervalId?: number; timeoutId?: number }> = new Map();
  private countersStarted = false;

  /** Mobile partners: auto-scroll pauses while user is touching */
  private partnersSliderContainer: HTMLElement | null = null;
  private partnersScrollRaf: number | null = null;
  private partnersIsTouching = false;
  private partnersResumeTimeout: ReturnType<typeof setTimeout> | null = null;
  /** RTL scroll mode: reset when language (dir) changes so slider keeps working */
  private partnersRtlUsesNegativeScroll: boolean | null = null;
  private partnersLastDir: 'ltr' | 'rtl' | null = null;

  // Services data - will be initialized in ngOnInit
  services: Array<{ key: string; description: string }> = [];

  // Stats data - will be initialized in ngOnInit
  stats: Array<{ icon: string; value: number; suffix: string; label: string }> = [];

  // Features data - will be initialized in ngOnInit
  features: Array<{ icon: string; title: string; text: string }> = [];

  // Process steps - will be initialized in ngOnInit
  processSteps: Array<{ title: string; description: string }> = [];

  // Partners data
  partners: Array<{ logo: string; name: string }> = [];

  constructor(public langService: LanguageService) {
    effect(() => {
      const lang = this.langService.currentLang();
      this.updateTranslations();
      // When language (and dir) changes, reset partners slider RTL state so it re-adapts and keeps auto-scrolling
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        this.partnersLastDir = null;
        this.partnersRtlUsesNegativeScroll = null;
      }
    });
  }

  updateTranslations(): void {
    // Update services
    this.services = [
      { key: 'exhibitionStand', description: this.langService.t('home.services.exhibitionStandDesc') },
      { key: 'exhibitionBoothDesign', description: this.langService.t('home.services.exhibitionBoothDesignDesc') },
      { key: 'displayUnitsMallKiosk', description: this.langService.t('home.services.displayUnitsMallKioskDesc') },
      { key: 'eventManagement', description: this.langService.t('home.services.eventManagementDesc') },
      { key: 'brandAmbassadorsEventHosts', description: this.langService.t('home.services.brandAmbassadorsEventHostsDesc') },
      { key: 'avService', description: this.langService.t('home.services.avServiceDesc') },
      { key: 'vehicleBrandingWrapping', description: this.langService.t('home.services.vehicleBrandingWrappingDesc') },
      { key: 'stickersCustomPrints', description: this.langService.t('home.services.stickersCustomPrintsDesc') }
    ];

    // Update stats
    this.stats = [
      { icon: 'assets/images/Icons/layers.png', value: 500, suffix: '+', label: this.langService.t('about.stat1') },
      { icon: 'assets/images/Icons/star.png', value: 15, suffix: '+', label: this.langService.t('about.stat2') },
      { icon: 'assets/images/Icons/smile.png', value: 98, suffix: '%', label: this.langService.t('about.stat3') },
      { icon: 'assets/images/Icons/globe.png', value: 50, suffix: '+', label: this.langService.t('about.stat4') || 'Countries Served' }
    ];

    // Update features
    this.features = [
      { icon: 'assets/images/Icons/InnovativeDesign.png', title: this.langService.t('home.features.innovativeDesign.title'), text: this.langService.t('home.features.innovativeDesign.text') },
      { icon: 'assets/images/Icons/rocket.png', title: this.langService.t('home.features.onTimeDelivery.title'), text: this.langService.t('home.features.onTimeDelivery.text') },
      { icon: 'assets/images/Icons/team.png', title: this.langService.t('home.features.expertTeam.title'), text: this.langService.t('home.features.expertTeam.text') },
      { icon: 'assets/images/Icons/star.png', title: this.langService.t('home.features.qualityMaterials.title'), text: this.langService.t('home.features.qualityMaterials.text') },
      { icon: 'assets/images/Icons/settings.png', title: this.langService.t('home.features.fullService.title'), text: this.langService.t('home.features.fullService.text') },
      { icon: 'assets/images/Icons/handshake.png', title: this.langService.t('home.features.clientFirst.title'), text: this.langService.t('home.features.clientFirst.text') }
    ];

    // Update process steps
    this.processSteps = [
      { title: this.langService.t('home.process.consultation.title'), description: this.langService.t('home.process.consultation.description') },
      { title: this.langService.t('home.process.designApproval.title'), description: this.langService.t('home.process.designApproval.description') },
      { title: this.langService.t('home.process.production.title'), description: this.langService.t('home.process.production.description') },
      { title: this.langService.t('home.process.installation.title'), description: this.langService.t('home.process.installation.description') }
    ];

    // Update partners from constant file
    this.partners = PARTNER_IMAGES.homeSlider.map((logo, index) => ({
      logo,
      name: `Partner ${index + 1}`
    }));
  }

  ngOnInit(): void {
    // Initialize all translations
    this.updateTranslations();

    // Simulate loading time to show shimmer effect (adjust time as needed)
    // Change to lower value like 500-1000 for production, or keep 2000 to see effect
    setTimeout(() => this.isLoaded.set(true), 2000);
    this.initScrollAnimations();
    this.initCounterAnimations();
    this.initParallaxEffects();
    this.initMobilePartnersSlider();
    // Ensure hero section has no transform applied
    setTimeout(() => {
      const hero = document.querySelector('.hero-section');
      if (hero) {
        (hero as HTMLElement).style.transform = 'none';
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.stopCounterAnimations();
    if (this.partnersScrollRaf != null) cancelAnimationFrame(this.partnersScrollRaf);
    if (this.partnersResumeTimeout != null) clearTimeout(this.partnersResumeTimeout);
  }

  /** On mobile: auto-scroll partners strip; pause while user is swiping. Works in LTR and RTL. Re-adapts when language (dir) changes. */
  private initMobilePartnersSlider(): void {
    if (typeof window === 'undefined' || window.innerWidth > 768) return;

    const afterLoad = () => {
      const container = document.querySelector('.partners-slider-container') as HTMLElement | null;
      if (!container) return;
      this.partnersSliderContainer = container;

      const scrollSpeed = 1;

      container.addEventListener('touchstart', () => {
        this.partnersIsTouching = true;
        if (this.partnersResumeTimeout != null) {
          clearTimeout(this.partnersResumeTimeout);
          this.partnersResumeTimeout = null;
        }
      }, { passive: true });

      container.addEventListener('touchend', () => {
        this.partnersResumeTimeout = setTimeout(() => {
          this.partnersIsTouching = false;
        }, 1500);
      }, { passive: true });

      const getScrollPosition = (el: HTMLElement): number => {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return 0;
        const left = el.scrollLeft;
        const isRtl = this.partnersLastDir === 'rtl';
        if (!isRtl) return left;
        if (this.partnersRtlUsesNegativeScroll === true) return -left;
        if (this.partnersRtlUsesNegativeScroll === false) return left;
        return left <= 0 ? -left : left;
      };

      const setScrollPosition = (el: HTMLElement, pos: number): void => {
        const maxScroll = el.scrollWidth - el.clientWidth;
        const isRtl = this.partnersLastDir === 'rtl';
        if (!isRtl) {
          el.scrollLeft = pos;
          return;
        }
        if (this.partnersRtlUsesNegativeScroll === true) {
          el.scrollLeft = -pos;
          return;
        }
        if (this.partnersRtlUsesNegativeScroll === false) {
          el.scrollLeft = pos;
          return;
        }
        el.scrollLeft = -pos;
        if (el.scrollLeft <= -1) this.partnersRtlUsesNegativeScroll = true;
        else {
          el.scrollLeft = pos;
          this.partnersRtlUsesNegativeScroll = false;
        }
      };

      const tick = () => {
        const el = document.querySelector('.partners-slider-container') as HTMLElement | null;
        if (!el) {
          this.partnersScrollRaf = requestAnimationFrame(tick);
          return;
        }
        const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
        const currentDir = isRtl ? 'rtl' : 'ltr';
        if (this.partnersLastDir !== currentDir) {
          this.partnersLastDir = currentDir;
          this.partnersRtlUsesNegativeScroll = isRtl ? null : false;
        }
        if (this.partnersIsTouching) {
          this.partnersScrollRaf = requestAnimationFrame(tick);
          return;
        }
        const half = el.scrollWidth / 2;
        let pos = getScrollPosition(el);
        pos += scrollSpeed;
        if (pos >= half) pos = 0;
        setScrollPosition(el, pos);
        this.partnersScrollRaf = requestAnimationFrame(tick);
      };
      this.partnersScrollRaf = requestAnimationFrame(tick);
    };

    setTimeout(afterLoad, 500);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.updateParallax();
    this.updateScrollReveals();
  }



  initScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    setTimeout(() => {
      const revealElements = document.querySelectorAll('.scroll-reveal');
      revealElements.forEach(element => observer.observe(element));
    }, 100);
  }

  initCounterAnimations(): void {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.countersStarted) {
          this.countersStarted = true;
          // Delay so scroll-reveal (0.8s) on stat cards finishes first, then start counters
          setTimeout(() => this.startInfiniteCounters(), 850);
        }
      });
    }, observerOptions);

    setTimeout(() => {
      const statsSection = document.querySelector('.stats-section');
      if (statsSection) {
        observer.observe(statsSection);
      }
    }, 100);
  }

  resetCounters(): void {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      counter.textContent = '0';
    });
  }

  stopCounterAnimations(): void {
    this.counterTimers.forEach((ids) => {
      if (ids.intervalId != null) clearInterval(ids.intervalId);
      if (ids.timeoutId != null) clearTimeout(ids.timeoutId);
    });
    this.counterTimers.clear();
  }

  startInfiniteCounters(): void {
    this.stopCounterAnimations();

    const counters = document.querySelectorAll('.stat-number');
    const duration = 2000;
    const pauseDuration = 200;
    const steps = 60;

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target') || '0');
      let current = 0;
      const increment = target / steps;
      const stepTime = duration / steps;

      const runCounter = () => {
        current = 0;
        counter.textContent = '0';

        const intervalId = window.setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            counter.textContent = target.toString();
            clearInterval(intervalId);

            const existing = this.counterTimers.get(counter) ?? {};
            existing.intervalId = undefined;
            this.counterTimers.set(counter, existing);

            const timeoutId = window.setTimeout(() => {
              runCounter();
            }, pauseDuration);
            this.counterTimers.set(counter, { ...this.counterTimers.get(counter), timeoutId });
          } else {
            counter.textContent = Math.floor(current).toString();
          }
        }, stepTime);

        this.counterTimers.set(counter, { intervalId, timeoutId: undefined });
      };

      runCounter();
    });
  }

  animateCounters(): void {
    // Kept for backwards compatibility, now calls infinite version
    this.startInfiniteCounters();
  }

  initParallaxEffects(): void {
    // Parallax effects removed - using normal scroll behavior
  }

  updateParallax(): void {
    const scrolled = window.pageYOffset;
    const elements = document.querySelectorAll('.parallax-element');
    elements.forEach((element, index) => {
      const speed = 0.3 + (index * 0.1);
      (element as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
    });
  }

  updateScrollReveals(): void {
    const reveals = document.querySelectorAll('.scroll-reveal');
    reveals.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('active');
      }
    });
  }



  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  getServiceIcon(key: string): string {
    const icons: { [key: string]: string } = {
      'exhibitionStand': 'fa-building',
      'exhibitionBoothDesign': 'fa-palette',
      'displayUnitsMallKiosk': 'fa-shopping-bag',
      'eventManagement': 'fa-theater-masks',
      'brandAmbassadorsEventHosts': 'fa-users',
      'avService': 'fa-video',
      'vehicleBrandingWrapping': 'fa-car',
      'stickersCustomPrints': 'fa-print',
      'fabricationManufacturing': 'fa-cogs'
    };
    return icons[key] || 'fa-star';
  }

  /** Service keys whose icon images are smaller in the source file – use larger class so they match others */
  getServiceIconSizeClass(key: string): string {
    const largerIconKeys = ['exhibitionStand', 'exhibitionBoothDesign'];
    return largerIconKeys.includes(key) ? 'home-page-icon-larger' : '';
  }

  getServiceIconPath(key: string): string {
    // Map service keys to their custom icon paths
    const iconPaths: { [key: string]: string } = {
      'exhibitionStand': 'assets/images/Icons/ExhibitionStand.png',
      'exhibitionBoothDesign': 'assets/images/Icons/signBoard.png',
      'displayUnitsMallKiosk': 'assets/images/Icons/displayUnit.png',
      'eventManagement': 'assets/images/Icons/event_managment.png',
      'brandAmbassadorsEventHosts': 'assets/images/Icons/brand.png',
      'avService': 'assets/images/Icons/avService.png',
      'vehicleBrandingWrapping': 'assets/images/Icons/car.png',
      'stickersCustomPrints': 'assets/images/Icons/stickers.png',
      'fabricationManufacturing': 'assets/images/Icons/ExhibitionStand.png'
    };
    return iconPaths[key] || 'assets/images/Icons/ExhibitionStand.png';
  }

  getServiceRoute(key: string): string {
    // Convert camelCase service key to kebab-case route
    const routeMap: { [key: string]: string } = {
      'exhibitionStand': 'exhibition-stand',
      'exhibitionBoothDesign': 'exhibition-booth-design',
      'displayUnitsMallKiosk': 'display-units-mall-kiosk',
      'eventManagement': 'event-management',
      'brandAmbassadorsEventHosts': 'brand-ambassadors-event-hosts',
      'avService': 'av-service',
      'vehicleBrandingWrapping': 'vehicle-branding-wrapping',
      'stickersCustomPrints': 'stickers-custom-prints',
      'fabricationManufacturing': 'fabrication-manufacturing'
    };
    return routeMap[key] || key.toLowerCase();
  }
}
