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

  constructor(
    public langService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Track route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveRoute();
      });
    
    // Initial check
    this.updateActiveRoute();
  }

  ngOnDestroy(): void {
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

  isServiceActive(serviceId: string): boolean {
    return this.activeServiceRoute() === serviceId;
  }

  isServicesDropdownActive(): boolean {
    return this.activeServiceRoute() !== '';
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
    this.updateActiveSection();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
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

  closeMobileMenu(): void {
    // Close Bootstrap collapse menu
    const navbarCollapse = document.getElementById('navbarContent');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
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
        }
      } else {
        // Fallback: manually remove show class
        navbarCollapse.classList.remove('show');
        const toggleButton = document.querySelector('.navbar-toggler');
        if (toggleButton) {
          toggleButton.setAttribute('aria-expanded', 'false');
        }
      }
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

