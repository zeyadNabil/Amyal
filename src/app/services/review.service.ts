import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review } from '../models/api.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api';
  reviews = signal<Review[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {
    this.loadReviews();
  }

  private isLocalDev(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  async loadReviews(): Promise<void> {
    this.isLoading.set(true);
    try {
      const reviews = await firstValueFrom(
        this.http.get<Review[]>(`${this.apiUrl}/get-reviews`)
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
        this.http.post<{ success: boolean; review: Review }>(`${this.apiUrl}/submit-review`, {
          name,
          rating,
          message
        })
      );
      
      if (response.success) {
        // Refresh reviews list
        await this.loadReviews();
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
        this.http.post<{ success: boolean }>(`${this.apiUrl}/delete-review`, {
          reviewId,
          password
        })
      );
      
      if (response.success) {
        // Refresh reviews list
        await this.loadReviews();
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
