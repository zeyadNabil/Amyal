import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { ReviewService } from '../../services/review.service';
import { Theme, Review } from '../../models/api.models';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  password = '';
  isAuthenticated = signal(false);
  activeTab = signal<'theme' | 'reviews'>('theme');
  
  // Theme management
  themeForm: Theme = {
    primaryColor: '#0E37AD',      // --blue (dark blue for buttons, headers)
    secondaryColor: '#027DF8',    // --purple (mid blue for accents)
    accentColor: '#60CEFE',       // --blue-bright (bright cyan for highlights)
    backgroundColor: '#0a0e1a',   // --bg-dark (page background)
    textColor: '#FFFFFF',         // --white (text color)
    gradientStart: '#0E37AD',     // gradient start color
    gradientEnd: '#60CEFE'        // gradient end color
  };
  themeMessage = signal('');
  themeSaving = signal(false);
  
  // Review management
  reviewsToManage = signal<Review[]>([]);
  reviewMessage = signal('');

  constructor(
    public themeService: ThemeService,
    public reviewService: ReviewService,
    public langService: LanguageService
  ) {}

  async ngOnInit(): Promise<void> {
    // Load the latest theme from backend
    await this.themeService.loadTheme();
    const currentTheme = this.themeService.currentTheme();
    if (currentTheme) {
      this.themeForm = { ...currentTheme };
    }
  }

  authenticate(): void {
    // Simple check - in real app you'd validate against backend
    if (this.password) {
      this.isAuthenticated.set(true);
      this.loadReviewsForManagement();
    }
  }

  switchTab(tab: 'theme' | 'reviews'): void {
    this.activeTab.set(tab);
    if (tab === 'reviews') {
      this.loadReviewsForManagement();
    }
  }

  async saveTheme(): Promise<void> {
    this.themeSaving.set(true);
    this.themeMessage.set('');
    
    const result = await this.themeService.updateTheme(this.themeForm, this.password);
    
    if (result.success) {
      this.themeMessage.set('Theme updated successfully! ✓');
      // Reload the current theme to get updated values
      await this.themeService.loadTheme();
      const currentTheme = this.themeService.currentTheme();
      if (currentTheme) {
        this.themeForm = { ...currentTheme };
      }
    } else {
      this.themeMessage.set(result.error || 'Failed to update theme');
    }
    
    this.themeSaving.set(false);
    
    // Clear message after 3 seconds
    setTimeout(() => this.themeMessage.set(''), 3000);
  }

  resetTheme(): void {
    this.themeForm = this.themeService.getDefaultTheme();
  }

  async loadReviewsForManagement(): Promise<void> {
    await this.reviewService.loadReviews();
    this.reviewsToManage.set(this.reviewService.reviews());
  }

  async deleteReview(reviewId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    const result = await this.reviewService.deleteReview(reviewId, this.password);
    
    if (result.success) {
      this.reviewMessage.set('Review deleted successfully! ✓');
      this.loadReviewsForManagement();
    } else {
      this.reviewMessage.set(result.error || 'Failed to delete review');
    }
    
    setTimeout(() => this.reviewMessage.set(''), 3000);
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
