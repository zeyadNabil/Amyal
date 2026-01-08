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

  constructor(public langService: LanguageService) {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
    this.updateActiveSection();
  }

  updateActiveSection(): void {
    const sections = ['home', 'about', 'gallery', 'contact'];
    
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

  toggleLanguage(): void {
    this.langService.toggleLanguage();
  }
}

