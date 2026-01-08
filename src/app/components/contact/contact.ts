import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements OnInit {
  contactForm: FormGroup;
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);

  constructor(
    private fb: FormBuilder,
    public langService: LanguageService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.initScrollAnimations();
    this.initFormAnimations();
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

