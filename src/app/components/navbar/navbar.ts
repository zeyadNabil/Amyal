import { Component, HostListener, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  isScrolled = signal(false);
  activeSection = signal('home');
  isDropdownOpen = signal(false);
  activeServiceRoute = signal<string>('');
  private routerSubscription?: Subscription;
  private isMenuToggling = false;

  constructor(
    public langService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    document.body.classList.toggle('nav-scrolled', window.scrollY > 50);
    // Track route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveRoute();
      });

    // Initial check
    this.updateActiveRoute();

    // Listen for Bootstrap collapse events
    this.setupMenuToggleListener();
  }

  setupMenuToggleListener(): void {
    // Prevent body scroll when menu is open
    const navbarCollapse = document.getElementById('navbarContent');
    const toggleButton = document.querySelector('.navbar-toggler') as HTMLElement;

    if (navbarCollapse && toggleButton) {
      // Listen for Bootstrap collapse events
      navbarCollapse.addEventListener('show.bs.collapse', () => {
        // Ensure display is set before animation starts
        navbarCollapse.style.display = 'block';
        void navbarCollapse.offsetHeight; // Force reflow
      });

      navbarCollapse.addEventListener('shown.bs.collapse', () => {
        document.body.style.overflow = 'hidden';
        toggleButton.setAttribute('aria-expanded', 'true');
        this.isMenuToggling = false;
      });

      navbarCollapse.addEventListener('hide.bs.collapse', () => {
        // Animation is starting to close
      });

      navbarCollapse.addEventListener('hidden.bs.collapse', () => {
        document.body.style.overflow = '';
        toggleButton.setAttribute('aria-expanded', 'false');
        navbarCollapse.style.display = '';
        this.isMenuToggling = false;
      });

      // Also listen for manual class changes (fallback)
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            if (target.classList.contains('show')) {
              document.body.style.overflow = 'hidden';
              toggleButton.setAttribute('aria-expanded', 'true');
            } else if (!target.classList.contains('collapsing')) {
              document.body.style.overflow = '';
              toggleButton.setAttribute('aria-expanded', 'false');
            }
          }
        });
      });

      observer.observe(navbarCollapse, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('nav-scrolled');
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  updateActiveRoute(): void {
    const url = this.router.url;
    if (url.startsWith('/services/')) {
      const serviceId = url.replace('/services/', '');
      this.activeServiceRoute.set(serviceId);
      this.activeSection.set('services');
    } else if (url.startsWith('/gallery')) {
      this.activeServiceRoute.set('');
      this.activeSection.set('gallery');
    } else if (url.startsWith('/about-us')) {
      this.activeServiceRoute.set('');
      this.activeSection.set('about');
    } else if (url.startsWith('/contact-us')) {
      this.activeServiceRoute.set('');
      this.activeSection.set('contact');
    } else if (url.startsWith('/partners')) {
      this.activeServiceRoute.set('');
      this.activeSection.set('partners');
    } else {
      this.activeServiceRoute.set('');
      // Only update activeSection if not on home page sections
      if (!url.includes('#')) {
        this.activeSection.set('home');
      }
    }
  }

  isHomeActive(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/' || url === '';
  }

  isServiceActive(serviceId: string): boolean {
    return this.activeServiceRoute() === serviceId;
  }

  isServicesDropdownActive(): boolean {
    return this.activeServiceRoute() !== '';
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrolled = window.scrollY > 50;
    this.isScrolled.set(scrolled);
    document.body.classList.toggle('nav-scrolled', scrolled);
    this.updateActiveSection();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Don't process clicks if menu is currently toggling
    if (this.isMenuToggling) {
      return;
    }

    // Close dropdown if clicking outside
    const dropdown = target.closest('.nav-item.dropdown');
    if (!dropdown) {
      this.isDropdownOpen.set(false);
    }

    // Close mobile menu if clicking outside
    const navbarContent = document.getElementById('navbarContent');
    const isMenuOpen = navbarContent && navbarContent.classList.contains('show');

    if (isMenuOpen) {
      const clickedInsideNavbar = target.closest('#navbarContent');
      const clickedOnToggler = target.closest('.navbar-toggler');

      // Close menu if click is outside both navbar content and toggler
      if (!clickedInsideNavbar && !clickedOnToggler) {
        this.closeMobileMenu();
      }
    }
  }

  updateActiveSection(): void {
    const sections = ['home', 'about', 'contact', 'gallery', 'partners'];

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom >= 200) {
          this.activeSection.set(section);
          break;
        }
      }
    }
  }

  scrollToSection(sectionId: string): void {
    // If we're not on the home page, navigate first
    if (this.router.url !== '/' && !this.router.url.startsWith('/#')) {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          this.scrollToSectionElement(sectionId);
        }, 100);
      });
      return;
    }

    this.scrollToSectionElement(sectionId);
  }

  private scrollToSectionElement(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80;
      const targetPosition = element.offsetTop - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      this.activeSection.set(sectionId);
    }
    // Close mobile menu
    this.closeMobileMenu();
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  toggleMobileMenu(): void {
    // Prevent multiple rapid clicks
    if (this.isMenuToggling) {
      return;
    }

    this.isMenuToggling = true;
    const navbarCollapse = document.getElementById('navbarContent');
    const toggleButton = document.querySelector('.navbar-toggler') as HTMLElement;

    if (!navbarCollapse || !toggleButton) {
      this.isMenuToggling = false;
      return;
    }

    const isCurrentlyOpen = navbarCollapse.classList.contains('show');

    // Use Bootstrap's collapse API if available
    if ((window as any).bootstrap) {
      let collapseInstance = (window as any).bootstrap.Collapse.getInstance(navbarCollapse);

      if (!collapseInstance) {
        // Initialize collapse if it doesn't exist with proper animation
        collapseInstance = new (window as any).bootstrap.Collapse(navbarCollapse, {
          toggle: false
        });
      }

      // Force reflow to ensure smooth animation
      void navbarCollapse.offsetHeight;

      if (isCurrentlyOpen) {
        collapseInstance.hide();
      } else {
        // Ensure the element is ready for animation
        // Remove any inline styles that might interfere
        navbarCollapse.style.display = '';
        // Force reflow to ensure smooth animation start
        void navbarCollapse.offsetHeight;
        // Now trigger the show animation
        collapseInstance.show();
      }
    } else {
      // Fallback: manually toggle with animation
      if (isCurrentlyOpen) {
        navbarCollapse.classList.remove('show');
        toggleButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      } else {
        // Ensure display is set before adding show class for smooth animation
        navbarCollapse.style.display = 'block';
        // Force reflow
        void navbarCollapse.offsetHeight;
        navbarCollapse.classList.add('show');
        toggleButton.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    }

    // Reset flag after animation completes
    setTimeout(() => {
      this.isMenuToggling = false;
    }, 400); // Slightly longer to ensure animation completes
  }

  closeMobileMenu(): void {
    // Prevent multiple rapid clicks
    if (this.isMenuToggling) {
      return;
    }

    // Close Bootstrap collapse menu
    const navbarCollapse = document.getElementById('navbarContent');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      this.isMenuToggling = true;

      // Use Bootstrap's collapse API if available
      if ((window as any).bootstrap) {
        const collapseInstance = (window as any).bootstrap.Collapse.getInstance(navbarCollapse);
        if (collapseInstance) {
          collapseInstance.hide();
        } else {
          // Fallback: manually remove show class
          navbarCollapse.classList.remove('show');
          // Update aria-expanded
          const toggleButton = document.querySelector('.navbar-toggler');
          if (toggleButton) {
            toggleButton.setAttribute('aria-expanded', 'false');
          }
          // Restore body scroll
          document.body.style.overflow = '';
        }
      } else {
        // Fallback: manually remove show class
        navbarCollapse.classList.remove('show');
        const toggleButton = document.querySelector('.navbar-toggler');
        if (toggleButton) {
          toggleButton.setAttribute('aria-expanded', 'false');
        }
        // Restore body scroll
        document.body.style.overflow = '';
      }

      // Reset flag after animation completes
      setTimeout(() => {
        this.isMenuToggling = false;
      }, 350);
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  handleNavClick(sectionId?: string): void {
    // Close mobile menu
    this.closeMobileMenu();
    // Close dropdown if open
    this.closeDropdown();
    // Scroll to top
    this.scrollToTop();
    // Execute scroll to section if provided
    if (sectionId) {
      setTimeout(() => this.scrollToSection(sectionId), 100);
    }
  }

  navigateToContact(): void {
    // Close mobile menu
    this.closeMobileMenu();
    // Close dropdown if open
    this.closeDropdown();
    // Navigate to contact page and scroll to top
    this.router.navigate(['/contact-us']).then(() => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    });
  }

  toggleLanguage(): void {
    this.langService.toggleLanguage();
  }
}

