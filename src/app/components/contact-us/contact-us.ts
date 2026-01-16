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
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);
  typedTitle = signal<string>('');
  isTyping = signal<boolean>(false);
  private typingTimeout: any = null;
  private languageEffect: any = null;

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

    // Watch for language changes and restart typing animation
    this.languageEffect = effect(() => {
      const translations = this.langService.translations();
      const currentLang = this.langService.currentLang();
      
      // Restart typing animation when language changes
      if (translations) {
        setTimeout(() => {
          this.startTypingAnimation();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.initScrollAnimations();
    this.initFormAnimations();
    // Start typing animation after a delay
    setTimeout(() => {
      this.startTypingAnimation();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.languageEffect) {
      this.languageEffect.destroy();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private startTypingAnimation(): void {
    this.typedTitle.set('');
    this.isTyping.set(true);

    const translationKey = 'contact.title';
    let fullTitle = this.langService.t(translationKey);

    // Check if translation exists
    if (!fullTitle || fullTitle === translationKey) {
      setTimeout(() => {
        fullTitle = this.langService.t(translationKey);
        if (fullTitle && fullTitle !== translationKey) {
          this.typeText(fullTitle);
        } else {
          this.typedTitle.set(fullTitle || 'Get In Touch');
          this.isTyping.set(false);
        }
      }, 200);
      return;
    }

    this.typeText(fullTitle);
  }

  private typeText(fullTitle: string): void {
    let currentIndex = 0;
    let timeoutId: any = null;

    const typeCharacter = () => {
      if (currentIndex < fullTitle.length) {
        this.typedTitle.set(fullTitle.substring(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(typeCharacter, 80);
        this.typingTimeout = timeoutId;
      } else {
        this.isTyping.set(false);
        this.typingTimeout = null;
      }
    };

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => typeCharacter(), 300);
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
