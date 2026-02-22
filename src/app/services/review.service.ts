import { Injectable, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review } from '../models/api.models';
import { firstValueFrom } from 'rxjs';

const REVIEWS_BROADCAST_CHANNEL = 'amyal-reviews-updated';

@Injectable({
  providedIn: 'root'
})
export class ReviewService implements OnDestroy {
  private apiUrl = '/api';
  reviews = signal<Review[]>([]);
  isLoading = signal(false);
  private broadcastChannel: BroadcastChannel | null = null;

  constructor(private http: HttpClient) {
    this.loadReviews();
    this.setupCrossTabRefresh();
  }

  ngOnDestroy(): void {
    this.broadcastChannel?.close();
  }

  /** Notify other tabs to refresh reviews (e.g. after add/delete from admin) */
  private setupCrossTabRefresh(): void {
    if (typeof BroadcastChannel === 'undefined') return;
    this.broadcastChannel = new BroadcastChannel(REVIEWS_BROADCAST_CHANNEL);
    this.broadcastChannel.onmessage = () => this.loadReviews();
  }

  private notifyOtherTabs(): void {
    this.broadcastChannel?.postMessage({ type: 'reviews-updated' });
  }

  private isLocalDev(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  async loadReviews(): Promise<void> {
    this.isLoading.set(true);
    try {
      const reviews = await firstValueFrom(
        this.http.get<Review[]>(`${this.apiUrl}/reviews`)
      );
      this.reviews.set(reviews);
    } catch {
      this.reviews.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadReviewsForAdmin(password: string): Promise<Review[]> {
    try {
      const reviews = await firstValueFrom(
        this.http.post<Review[]>(`${this.apiUrl}/reviews`, { action: 'listAll', password })
      );
      return Array.isArray(reviews) ? reviews : [];
    } catch {
      return [];
    }
  }

  async approveReview(reviewId: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean }>(`${this.apiUrl}/reviews`, { action: 'approve', reviewId, password })
      );
      if (response.success) {
        await this.loadReviews();
        this.notifyOtherTabs();
        return { success: true };
      }
      return { success: false, error: 'Failed to approve review' };
    } catch (error: unknown) {
      const err = error as { status?: number; error?: { error?: string } };
      return { success: false, error: err?.error?.error || 'Failed to approve review' };
    }
  }

  async denyReview(reviewId: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean }>(`${this.apiUrl}/reviews`, { action: 'deny', reviewId, password })
      );
      if (response.success) {
        await this.loadReviews();
        this.notifyOtherTabs();
        return { success: true };
      }
      return { success: false, error: 'Failed to deny review' };
    } catch (error: unknown) {
      const err = error as { status?: number; error?: { error?: string } };
      return { success: false, error: err?.error?.error || 'Failed to deny review' };
    }
  }

  async submitReview(name: string, rating: number, message: string, image?: string, adminPassword?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: Record<string, unknown> = { name, rating, message };
      if (image) payload['image'] = image;
      if (adminPassword) payload['password'] = adminPassword;
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; review: Review }>(`${this.apiUrl}/reviews`, payload)
      );
      
      if (response.success) {
        if (!adminPassword) {
          await this.loadReviews();
          this.notifyOtherTabs();
        }
        return { success: true };
      }
      
      return { success: false, error: 'Failed to submit review' };
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
      
      // Better error extraction
      const err = error as { error?: { error?: string }; message?: string };
      let errorMessage = 'Failed to submit review';
      if (err?.error && typeof err.error === 'object' && err.error.error) {
        errorMessage = err.error.error;
      } else if (err?.error && typeof err.error === 'string') {
        errorMessage = err.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  async deleteReview(reviewId: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean }>(`${this.apiUrl}/reviews`, {
          action: 'delete',
          reviewId,
          password
        })
      );
      
      if (response.success) {
        await this.loadReviews();
        this.notifyOtherTabs();
        return { success: true };
      }
      
      return { success: false, error: 'Failed to delete review' };
    } catch (error: any) {
      console.error('Error deleting review:', error);
      return { 
        success: false, 
        error: error.status === 401 ? 'Invalid password' : 'Failed to delete review' 
      };
    }
  }

  getApprovedReviews(): Review[] {
    return this.reviews().filter(r => r.approved);
  }
}
