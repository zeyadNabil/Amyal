import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  isScrolled = signal(false);
  activeSection = signal('home');
  isDropdownOpen = signal(false);

  constructor(public langService: LanguageService) {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
    this.updateActiveSection();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.nav-item.dropdown');
    if (!dropdown) {
      this.isDropdownOpen.set(false);
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
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80;
      const targetPosition = element.offsetTop - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      this.activeSection.set(sectionId);

      // Close mobile menu if open
      const navbarCollapse = document.querySelector('.navbar-collapse.show');
      if (navbarCollapse) {
        navbarCollapse.classList.remove('show');
      }
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  toggleLanguage(): void {
    this.langService.toggleLanguage();
  }
}

