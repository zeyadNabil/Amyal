import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { LanguageService } from '../../services/language.service';

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
  imageDataUrl = '';
  imageError = signal('');
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

  onImageChange(event: Event): void {
    this.imageError.set('');
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.imageDataUrl = '';
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.imageError.set(this.langService.t('reviewForm.imageTypeError') || 'Please use JPEG, PNG or WebP');
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      this.imageError.set(this.langService.t('reviewForm.imageSizeError') || 'Image must be under 500KB');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imageDataUrl = (reader.result as string) || '';
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.imageDataUrl = '';
    this.imageError.set('');
    const input = document.getElementById('review-image-input') as HTMLInputElement;
    if (input) input.value = '';
  }

  async submitReview(): Promise<void> {
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

    const displayName = this.name.trim() || (this.langService.t('reviewForm.anonymous') || 'Anonymous User');
    const result = await this.reviewService.submitReview(
      displayName,
      this.rating,
      this.message.trim(),
      this.imageDataUrl || undefined
    );

    if (result.success) {
      this.submitSuccess.set(true);
      this.submitMessage.set(this.langService.t('reviewForm.pendingSuccess') || 'Your review has been submitted and is pending approval. Thank you! ✓');
      
      // Reset form
      this.name = '';
      this.rating = 5;
      this.message = '';
      this.clearImage();
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    } else {
      let msg = result.error || 'Failed to submit review';
      if (msg.toLowerCase().includes('review per day') || msg.toLowerCase().includes('per day')) {
        msg = this.langService.t('reviewForm.oneReviewPerDay') || msg;
      }
      this.submitMessage.set(msg);
      this.submitSuccess.set(false);
    }

    this.isSubmitting.set(false);
  }

  getStarClass(starRating: number): string {
    return starRating <= this.rating ? 'fas fa-star active' : 'far fa-star';
  }
}
