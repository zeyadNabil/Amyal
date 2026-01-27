import { Component, OnInit, HostListener, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
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

  // Gallery preview items - will be initialized in ngOnInit
  galleryItems: Array<{ image: string; title: string; category: string }> = [];

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
      { key: 'stickersCustomPrints', description: this.langService.t('home.services.stickersCustomPrintsDesc') },
      { key: 'fabricationManufacturing', description: this.langService.t('home.services.fabricationManufacturingDesc') }
    ];

    // Update stats
    this.stats = [
      { icon: 'fa-chart-bar', value: 500, suffix: '+', label: this.langService.t('about.stat1') },
      { icon: 'fa-star', value: 15, suffix: '+', label: this.langService.t('about.stat2') },
      { icon: 'fa-smile', value: 98, suffix: '%', label: this.langService.t('about.stat3') },
      { icon: 'fa-globe', value: 50, suffix: '+', label: this.langService.t('about.stat4') || 'Countries Served' }
    ];

    // Update features
    this.features = [
      { icon: 'fa-palette', title: this.langService.t('home.features.innovativeDesign.title'), text: this.langService.t('home.features.innovativeDesign.text') },
      { icon: 'fa-bolt', title: this.langService.t('home.features.onTimeDelivery.title'), text: this.langService.t('home.features.onTimeDelivery.text') },
      { icon: 'fa-users', title: this.langService.t('home.features.expertTeam.title'), text: this.langService.t('home.features.expertTeam.text') },
      { icon: 'fa-gem', title: this.langService.t('home.features.qualityMaterials.title'), text: this.langService.t('home.features.qualityMaterials.text') },
      { icon: 'fa-rocket', title: this.langService.t('home.features.fullService.title'), text: this.langService.t('home.features.fullService.text') },
      { icon: 'fa-handshake', title: this.langService.t('home.features.clientFirst.title'), text: this.langService.t('home.features.clientFirst.text') }
    ];

    // Update gallery items
    this.galleryItems = [
      { image: 'assets/images/gallery/frame_1.jpg', title: this.langService.t('gallery.items.exhibitionStand.title'), category: this.langService.t('gallery.items.exhibitionStand.category') },
      { image: 'assets/images/gallery/frame_2.jpg', title: this.langService.t('gallery.items.eventProduction.title'), category: this.langService.t('gallery.items.eventProduction.category') },
      { image: 'assets/images/gallery/frame_3.jpg', title: this.langService.t('gallery.items.brandingSolutions.title'), category: this.langService.t('gallery.items.brandingSolutions.category') },
      { image: 'assets/images/gallery/frame_4.jpg', title: this.langService.t('gallery.items.customFabrication.title'), category: this.langService.t('gallery.items.customFabrication.category') }
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
      { logo: 'assets/images/Amyal PNG Partners/573521118_18541182556065137_6745484161360848157_n-Photoroom.png', name: 'Partner 1' },
      { logo: 'assets/images/Amyal PNG Partners/ADSB.png-Photoroom.png', name: 'ADSB' },
      { logo: 'assets/images/Amyal PNG Partners/baniyas-sc-seeklogo.png', name: 'Baniyas SC' },
      { logo: 'assets/images/Amyal PNG Partners/bawabat-alsharq-mall-logo.png', name: 'Bawabat Alsharq Mall' },
      { logo: 'assets/images/Amyal PNG Partners/brand.png', name: 'Brand' },
      { logo: 'assets/images/Amyal PNG Partners/craiyon.png', name: 'Craiyon' },
      { logo: 'assets/images/Amyal PNG Partners/dubai-sports-council-thumb.png', name: 'Dubai Sports Council' },
      { logo: 'assets/images/Amyal PNG Partners/emirates center for strategic studies and research.png', name: 'Emirates Center' },
      { logo: 'assets/images/Amyal PNG Partners/logo-en.png', name: 'Logo' },
      { logo: 'assets/images/Amyal PNG Partners/Makani.png', name: 'Makani' },
      { logo: 'assets/images/Amyal PNG Partners/Ministry-of-Human-Resources-&-Emiratisation-.png', name: 'Ministry of Human Resources' },
      { logo: 'assets/images/Amyal PNG Partners/MOCCAE_Horizontal-en.png', name: 'MOCCAE' },
      { logo: 'assets/images/Amyal PNG Partners/MOET_Horizontal_RGB_A.png', name: 'MOET' },
      { logo: 'assets/images/Amyal PNG Partners/mofaicuaelogo.png', name: 'MOFAIC UAE' },
      { logo: 'assets/images/Amyal PNG Partners/SAAS properties.png', name: 'SAAS Properties' },
      { logo: 'assets/images/Amyal PNG Partners/umex_and_simtex.png', name: 'UMEX & Simtex' }
    ];
  }

  ngOnInit(): void {
    // Initialize all translations
    this.updateTranslations();

    setTimeout(() => this.isLoaded.set(true), 100);
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
