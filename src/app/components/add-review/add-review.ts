import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-review.html',
  styleUrl: './add-review.css'
})
export class AddReview {
  name = '';
  rating = 5;
  message = '';
  isSubmitting = signal(false);
  submitMessage = signal('');
  submitSuccess = signal(false);

  constructor(
    private reviewService: ReviewService,
    public langService: LanguageService,
    private router: Router
  ) {}

  setRating(rating: number): void {
    this.rating = rating;
  }

  async submitReview(): Promise<void> {
    // Validate
    if (!this.name.trim()) {
      this.submitMessage.set(this.langService.t('reviewForm.errorName') || 'Please enter your name');
      return;
    }

    if (!this.message.trim()) {
      this.submitMessage.set(this.langService.t('reviewForm.errorMessage') || 'Please enter your review message');
      return;
    }

    if (this.message.trim().length < 10) {
      this.submitMessage.set(this.langService.t('reviewForm.errorMinLength') || 'Review must be at least 10 characters');
      return;
    }

    this.isSubmitting.set(true);
    this.submitMessage.set('');

    const result = await this.reviewService.submitReview(
      this.name.trim(),
      this.rating,
      this.message.trim()
    );

    if (result.success) {
      this.submitSuccess.set(true);
      this.submitMessage.set(this.langService.t('reviewForm.success') || 'Thank you for your review! ✓');
      
      // Reset form
      this.name = '';
      this.rating = 5;
      this.message = '';
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    } else {
      this.submitMessage.set(result.error || 'Failed to submit review');
      this.submitSuccess.set(false);
    }

    this.isSubmitting.set(false);
  }

  getStarClass(starRating: number): string {
    return starRating <= this.rating ? 'fas fa-star active' : 'far fa-star';
  }
}
