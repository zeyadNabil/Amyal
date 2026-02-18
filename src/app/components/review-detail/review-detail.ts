import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { LanguageService } from '../../services/language.service';
import { Review } from '../../models/api.models';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './review-detail.html',
  styleUrl: './review-detail.css'
})
export class ReviewDetail implements OnInit {
  review = signal<Review | null>(null);
  notFound = signal(false);

  constructor(
    private route: ActivatedRoute,
    public reviewService: ReviewService,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    this.reviewService.loadReviews().then(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        this.notFound.set(true);
        return;
      }
      const found = this.reviewService.reviews().find(r => r.id === id && r.approved);
      if (found) {
        this.review.set(found);
      } else {
        this.notFound.set(true);
      }
    });
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

}
