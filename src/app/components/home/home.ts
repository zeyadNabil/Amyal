import { Component, OnInit, HostListener, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { ShimmerLoader } from '../shimmer-loader/shimmer-loader';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ShimmerLoader],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  isLoaded = signal(false);
  private counterTimers: Map<Element, any> = new Map();

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
      // Update all translations when language changes
      this.updateTranslations();
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
      { icon: 'assets/images/Icons/glope.png', value: 50, suffix: '+', label: this.langService.t('about.stat4') || 'Countries Served' }
    ];

    // Update features
    this.features = [
      { icon: 'assets/images/Icons/festival.png', title: this.langService.t('home.features.innovativeDesign.title'), text: this.langService.t('home.features.innovativeDesign.text') },
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

    // Update partners
    this.partners = [
      { logo: 'assets/images/Partners White Text Without Background/baniyas-sc-seeklogo.png', name: 'Baniyas SC' },
      { logo: 'assets/images/Partners White Text Without Background/craiyon_upscaled.png', name: 'Craiyon' },
      { logo: 'assets/images/Partners White Text Without Background/emirates center for strategic studies and research_upscaled.png', name: 'Emirates Center' },
      { logo: 'assets/images/Partners White Text Without Background/logo-en_upscaled.png', name: 'Logo' },
      { logo: 'assets/images/Partners White Text Without Background/Mair_upscaled.png', name: 'Mair' },
      { logo: 'assets/images/Partners White Text Without Background/Makani_upscaled.png', name: 'Makani' },
      { logo: 'assets/images/Partners White Text Without Background/Ministry-of-Human-Resources-&-Emiratisation-_upscaled.png', name: 'Ministry of Human Resources' },
      { logo: 'assets/images/Partners White Text Without Background/SAAS properties_upscaled.png', name: 'SAAS Properties' },
      { logo: 'assets/images/Partners White Text Without Background/umex_and_simtex_upscaled.png', name: 'UMEX & Simtex' },
      { logo: 'assets/images/Amyal PNG Partners/mubadala.png', name: 'Mubadala' },
      { logo: 'assets/images/Amyal PNG Partners/Shahat.png', name: 'Shahat' },
      { logo: 'assets/images/Amyal PNG Partners/mair green.png', name: 'Mair Green' }
    ];
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
    // Ensure hero section has no transform applied
    setTimeout(() => {
      const hero = document.querySelector('.hero-section');
      if (hero) {
        (hero as HTMLElement).style.transform = 'none';
      }
    }, 100);
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
      threshold: 0.5,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Reset counters to 0 first, then animate
          this.resetCounters();
          // Small delay to ensure reset is visible, then animate
          setTimeout(() => {
            this.animateCounters();
          }, 50);
        } else {
          // When section leaves view, stop any running animations and reset
          this.stopCounterAnimations();
          this.resetCounters();
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
    // Clear all running timers
    this.counterTimers.forEach((timer) => {
      clearInterval(timer);
    });
    this.counterTimers.clear();
  }

  animateCounters(): void {
    // Stop any existing animations first
    this.stopCounterAnimations();

    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target') || '0');
      let current = 0;
      const increment = target / 60;
      const duration = 2000;
      const stepTime = duration / 60;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
          this.counterTimers.delete(counter);
        }
        counter.textContent = Math.floor(current).toString();
      }, stepTime);

      // Store the timer so we can clear it later
      this.counterTimers.set(counter, timer);
    });
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
