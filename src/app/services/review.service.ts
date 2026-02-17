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
      // API may be unavailable (e.g. dev without backend)
      this.reviews.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async submitReview(name: string, rating: number, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; review: Review }>(`${this.apiUrl}/reviews`, {
          name,
          rating,
          message
        })
      );
      
      if (response.success) {
        await this.loadReviews();
        this.notifyOtherTabs();
        return { success: true };
      }
      
      return { success: false, error: 'Failed to submit review' };
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      // Better error extraction
      let errorMessage = 'Failed to submit review';
      
      if (error.error && typeof error.error === 'object') {
        errorMessage = error.error.error || error.error.message || error.message || errorMessage;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
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
