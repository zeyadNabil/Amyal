import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements OnInit {
  hasAnimatedCounters = signal(false);

  constructor(public langService: LanguageService) {}

  ngOnInit(): void {
    this.initScrollAnimations();
    this.initImageAnimations();
    this.initCounterAnimations();
  }

  initScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
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

  initImageAnimations(): void {
    const imageObserverOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    };

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Unobserve after animation
          imageObserver.unobserve(entry.target);
        }
      });
    }, imageObserverOptions);

    setTimeout(() => {
      const imageContainers = document.querySelectorAll('.image-fade, .about-image-main, .about-image-float');
      imageContainers.forEach(container => imageObserver.observe(container));
    }, 100);
  }

  initCounterAnimations(): void {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimatedCounters()) {
          this.hasAnimatedCounters.set(true);
          this.animateCounters();
        }
      });
    }, observerOptions);

    setTimeout(() => {
      const statsSection = document.querySelector('.about-stats');
      if (statsSection) {
        observer.observe(statsSection);
      }
    }, 100);
  }

  animateCounters(): void {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
      const target = counter.textContent || '';
      const isPercentage = target.includes('%');
      const isPlus = target.includes('+');
      const numericValue = parseInt(target.replace(/[^0-9]/g, ''));
      
      let current = 0;
      const increment = numericValue / 40;
      const duration = 1200;
      const stepTime = duration / 40;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          current = numericValue;
          clearInterval(timer);
        }
        
        let displayValue: string = Math.floor(current).toString();
        if (isPercentage) displayValue += '%';
        if (isPlus) displayValue += '+';
        
        counter.textContent = displayValue;
      }, stepTime);
    });
  }
}

