import { Component, OnInit, HostListener, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-hero',
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero implements OnInit {
  isLoaded = signal(false);

  constructor(public langService: LanguageService) {
    // React to language changes
    effect(() => {
      const lang = this.langService.currentLang();
      console.log('Language changed to:', lang);
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.isLoaded.set(true), 100);
    this.animateOnLoad();
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const heroImage = document.querySelector('.hero-image') as HTMLElement;
    if (heroImage) {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.3;
      heroImage.style.transform = `translateY(${parallax}px)`;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const heroLogo = document.querySelector('.hero-logo-img') as HTMLElement;
    if (heroLogo) {
      const rect = heroLogo.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * 0.02;
      const deltaY = (e.clientY - centerY) * 0.02;
      
      heroLogo.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
  }

  animateOnLoad(): void {
    setTimeout(() => {
      const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up');
      fadeElements.forEach((element: Element, index: number) => {
        setTimeout(() => {
          (element as HTMLElement).style.opacity = '1';
          (element as HTMLElement).style.transform = 'translateY(0)';
        }, index * 50);
      });
    }, 50);
  }

  scrollToContact(): void {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}

