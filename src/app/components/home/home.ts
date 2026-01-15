import { Component, OnInit, HostListener, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  isLoaded = signal(false);
  hasAnimatedCounters = signal(false);
  contactForm: FormGroup;
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);

  constructor(
    public langService: LanguageService,
    private fb: FormBuilder
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    // React to language changes
    effect(() => {
      const lang = this.langService.currentLang();
      console.log('Language changed to:', lang);
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.isLoaded.set(true), 100);
    this.animateOnLoad();
    this.initScrollAnimations();
    this.initImageAnimations();
    this.initCounterAnimations();
    this.initFormAnimations();
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

  initFormAnimations(): void {
    setTimeout(() => {
      const inputs = document.querySelectorAll('.form-control');

      inputs.forEach(input => {
        input.addEventListener('focus', (event: Event) => {
          const target = event.target as HTMLElement;
          const parent = target.parentElement;
          if (parent) {
            parent.style.transform = 'translateY(-2px)';
            parent.style.transition = 'transform 0.3s ease';
          }
        });

        input.addEventListener('blur', (event: Event) => {
          const target = event.target as HTMLElement;
          const parent = target.parentElement;
          if (parent) {
            parent.style.transform = 'translateY(0)';
          }
        });
      });
    }, 100);
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      this.submitError.set(false);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.contactForm.reset();

        // Reset success message after 3 seconds
        setTimeout(() => {
          this.submitSuccess.set(false);
        }, 3000);
      }, 1500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get phone() { return this.contactForm.get('phone'); }
  get message() { return this.contactForm.get('message'); }
}
