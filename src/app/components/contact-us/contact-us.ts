import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css'
})
export class ContactUs implements OnInit, OnDestroy {
  contactForm: FormGroup;
  isLoaded = signal(false);
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);
  titleFadeState = signal<'fade-out' | 'fade-in' | 'visible'>('fade-out');
  private fadeTimeout: any = null;
  private languageEffect: any = null;

  constructor(
    public langService: LanguageService,
    private fb: FormBuilder
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', []],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Watch for language changes and restart fade animation
    this.languageEffect = effect(() => {
      const translations = this.langService.translations();
      const currentLang = this.langService.currentLang();

      // Restart fade animation when language changes
      if (translations) {
        setTimeout(() => {
          this.startFadeAnimation();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    // Load content immediately
    this.isLoaded.set(true);
    this.initScrollAnimations();
    this.initFormAnimations();
    // Start fade animation after a delay
    setTimeout(() => {
      this.startFadeAnimation();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.languageEffect) {
      this.languageEffect.destroy();
    }
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }
  }

  private startFadeAnimation(): void {
    // Fade out first
    this.titleFadeState.set('fade-out');

    // After fade out completes, fade in
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }

    this.fadeTimeout = setTimeout(() => {
      this.titleFadeState.set('fade-in');
      // After fade in completes, set to visible
      this.fadeTimeout = setTimeout(() => {
        this.titleFadeState.set('visible');
      }, 800);
    }, 400);
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
      const formValues = this.contactForm.value;
      
      // Construct email details
      const recipientEmail = 'Info@amyalmedia.ae';
      
      // Build subject with optional name and phone
      let subject = 'Contact Form Submission';
      if (formValues.name || formValues.phone) {
        subject += ' - ';
        if (formValues.name) {
          subject += formValues.name;
        }
        if (formValues.phone) {
          subject += (formValues.name ? ' | ' : '') + formValues.phone;
        }
      }
      
      // Build email body
      let body = formValues.message || '';
      
      // Add sender details to body if available
      if (formValues.name || formValues.email || formValues.phone) {
        body += '\n\n---\n';
        body += 'Contact Details:\n';
        if (formValues.name) body += `Name: ${formValues.name}\n`;
        if (formValues.email) body += `Email: ${formValues.email}\n`;
        if (formValues.phone) body += `Phone: ${formValues.phone}\n`;
      }
      
      // Detect mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile: Use mailto directly
        const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
      } else {
        // Desktop: Open Gmail web compose
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
      }
      
      // Show brief feedback
      this.isSubmitting.set(true);
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.contactForm.reset();

        // Reset success message after 3 seconds
        setTimeout(() => {
          this.submitSuccess.set(false);
        }, 3000);
      }, 800);
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
