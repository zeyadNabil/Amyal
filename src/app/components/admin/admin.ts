import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { ReviewService } from '../../services/review.service';
import { Theme, Review } from '../../models/api.models';
import { LanguageService } from '../../services/language.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  password = '';
  isAuthenticated = signal(false);
  activeTab = signal<'theme' | 'reviews'>('theme');
  authError = signal('');
  isAuthenticating = signal(false);
  
  // Theme management
  advancedMode = signal(false); // Toggle for simple/advanced theming
  themeForm: Theme = {
    primaryColor: '#0E37AD',
    secondaryColor: '#027DF8',
    accentColor: '#60CEFE',
    backgroundColor: '#0a0e1a',
    textColor: '#FFFFFF',
    gradientStart: '#0E37AD',
    gradientEnd: '#60CEFE',
    borderColor: '#1e293b',
    backgroundColorDarker: '#050810',
    backgroundColorNavy: '#141824',
    mutedTextColor: '#94A3B8',
    linkColor: '#60CEFE',
    cardBorderColor: '#334155'
  };
  themeMessage = signal('');
  themeSaving = signal(false);
  savedThemeName = '';
  selectedSavedThemeId = '';
  savingPreset = signal(false);
  applyingPreset = signal(false);
  
  // Review management
  reviewsToManage = signal<Review[]>([]);
  reviewMessage = signal('');
  deleteConfirmVisible = signal(false);
  reviewToDelete = signal<string | null>(null);

  constructor(
    public themeService: ThemeService,
    public reviewService: ReviewService,
    public langService: LanguageService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.themeService.loadTheme();
    await this.themeService.loadSavedThemes();
    const currentTheme = this.themeService.currentTheme();
    if (currentTheme) {
      this.themeForm = { ...this.themeForm, ...currentTheme };
    }
  }

  async authenticate(): Promise<void> {
    if (!this.password) {
      this.authError.set('Please enter a password');
      return;
    }

    this.isAuthenticating.set(true);
    this.authError.set('');

    try {
      const response = await fetch('/api/validate-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: this.password })
      });

      const result = await response.json();

      if (result.isValid) {
        this.isAuthenticated.set(true);
        await this.loadReviewsForManagement();
      } else {
        this.authError.set(result.error || 'Invalid password');
        this.password = '';
      }
    } catch (error) {
      console.error('Authentication error:', error);
      this.authError.set('Authentication failed. Please try again.');
    } finally {
      this.isAuthenticating.set(false);
    }
  }

  switchTab(tab: 'theme' | 'reviews'): void {
    this.activeTab.set(tab);
    if (tab === 'reviews') {
      this.loadReviewsForManagement();
    }
  }

  toggleAdvancedMode(): void {
    this.advancedMode.set(!this.advancedMode());
    if (!this.advancedMode()) {
      this.syncGradients();
    } else {
      // When switching to advanced, ensure advanced fields have defaults
      this.themeForm.borderColor ??= '#1e293b';
      this.themeForm.backgroundColorDarker ??= '#050810';
      this.themeForm.backgroundColorNavy ??= '#141824';
      this.themeForm.mutedTextColor ??= '#94A3B8';
      this.themeForm.linkColor ??= this.themeForm.accentColor;
      this.themeForm.cardBorderColor ??= '#334155';
    }
  }

  onPrimaryColorChange(): void {
    // In simple mode, auto-sync gradient start with primary color
    if (!this.advancedMode()) {
      this.themeForm.gradientStart = this.themeForm.primaryColor;
    }
  }

  onAccentColorChange(): void {
    // In simple mode, auto-sync gradient end with accent color
    if (!this.advancedMode()) {
      this.themeForm.gradientEnd = this.themeForm.accentColor;
    }
  }

  syncGradients(): void {
    // Sync gradients with primary and accent colors
    this.themeForm.gradientStart = this.themeForm.primaryColor;
    this.themeForm.gradientEnd = this.themeForm.accentColor;
  }

  async saveTheme(): Promise<void> {
    this.themeSaving.set(true);
    this.themeMessage.set('');
    
    // Ensure gradients are synced in simple mode before saving
    if (!this.advancedMode()) {
      this.syncGradients();
    }
    
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
    if (!this.advancedMode()) {
      this.syncGradients();
    }
  }

  async saveThemePreset(): Promise<void> {
    const name = this.savedThemeName?.trim();
    if (!name) {
      this.themeMessage.set('Please enter a theme name');
      setTimeout(() => this.themeMessage.set(''), 3000);
      return;
    }
    this.savingPreset.set(true);
    this.themeMessage.set('');
    if (!this.advancedMode()) this.syncGradients();
    const result = await this.themeService.saveThemePreset(name, this.themeForm, this.password);
    if (result.success) {
      this.themeMessage.set(`Theme "${name}" saved successfully! ✓`);
      this.savedThemeName = '';
    } else {
      this.themeMessage.set(result.error || 'Failed to save theme');
    }
    this.savingPreset.set(false);
    setTimeout(() => this.themeMessage.set(''), 3000);
  }

  async applySavedTheme(id: string): Promise<void> {
    this.applyingPreset.set(true);
    this.themeMessage.set('');
    const result = await this.themeService.applyThemePreset(id, this.password);
    if (result.success && result.theme) {
      this.themeForm = { ...result.theme };
      this.themeMessage.set('Theme applied successfully! ✓');
    } else {
      this.themeMessage.set(result.error || 'Failed to apply theme');
    }
    this.applyingPreset.set(false);
    setTimeout(() => this.themeMessage.set(''), 3000);
  }

  async loadReviewsForManagement(): Promise<void> {
    await this.reviewService.loadReviews();
    this.reviewsToManage.set(this.reviewService.reviews());
  }

  openDeleteConfirm(reviewId: string): void {
    this.reviewToDelete.set(reviewId);
    this.deleteConfirmVisible.set(true);
  }

  closeDeleteConfirm(): void {
    this.deleteConfirmVisible.set(false);
    this.reviewToDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const reviewId = this.reviewToDelete();
    if (!reviewId) return;

    this.closeDeleteConfirm();
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
