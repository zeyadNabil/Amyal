import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { LanguageService } from '../../services/language.service';
import { Review } from '../../models/api.models';

@Component({
  selector: 'app-reviews-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reviews-slider.html',
  styleUrl: './reviews-slider.css'
})
export class ReviewsSlider implements OnInit, OnDestroy, AfterViewInit {
  // Use computed signal that automatically updates when service reviews change
  reviews = computed(() => this.reviewService.reviews().filter(r => r.approved));

  // When false: cards fit, center them. When true: overflow, use flex-start so first card is visible
  sliderHasOverflow = signal(false);
  
  // Desktop drag functionality
  private reviewsSliderContainer: HTMLElement | null = null;
  private reviewsIsMouseDown = false;
  private reviewsStartX = 0;
  private reviewsScrollLeftStart = 0;
  private reviewsHasDragged = false;
  
  // Mobile touch functionality
  private reviewsIsTouching = false;
  private reviewsResumeTimeout: ReturnType<typeof setTimeout> | null = null;
  private reviewsScrollRaf: number | null = null;


  constructor(
    public reviewService: ReviewService,
    public langService: LanguageService
  ) {
    effect(() => {
      const list = this.reviews();
      setTimeout(() => this.checkSliderOverflow(), 0);
      if (list.length > 0 && typeof window !== 'undefined' && window.innerWidth > 768) {
        setTimeout(() => this.initDesktopReviewsDrag(), 100);
      }
    });
  }

  ngOnInit(): void {
    this.initMobileReviewsSlider();
    this.initDesktopReviewsDrag();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.checkSliderOverflow(), 100);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkSliderOverflow();
    if (typeof window !== 'undefined' && window.innerWidth > 768 && this.reviews().length > 0) {
      setTimeout(() => this.initDesktopReviewsDrag(), 50);
    }
  }

  private checkSliderOverflow(): void {
    if (typeof document === 'undefined' || this.reviews().length === 0) return;
    const container = document.querySelector('.reviews-slider-container') as HTMLElement | null;
    if (!container) return;
    const hasOverflow = container.scrollWidth > container.clientWidth;
    if (this.sliderHasOverflow() !== hasOverflow) {
      this.sliderHasOverflow.set(hasOverflow);
    }
  }

  ngOnDestroy(): void {
    if (this.reviewsScrollRaf != null) cancelAnimationFrame(this.reviewsScrollRaf);
    if (this.reviewsResumeTimeout != null) clearTimeout(this.reviewsResumeTimeout);
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  /** Mobile: auto-scroll reviews (pause while user swiping) */
  private initMobileReviewsSlider(): void {
    if (typeof window === 'undefined' || window.innerWidth > 768) return;

    const afterLoad = () => {
      const container = document.querySelector('.reviews-slider-container') as HTMLElement | null;
      if (!container) return;
      this.reviewsSliderContainer = container;

      const scrollSpeed = 0.5;

      container.addEventListener('touchstart', () => {
        this.reviewsIsTouching = true;
        if (this.reviewsResumeTimeout != null) {
          clearTimeout(this.reviewsResumeTimeout);
          this.reviewsResumeTimeout = null;
        }
      }, { passive: true });

      container.addEventListener('touchend', () => {
        this.reviewsResumeTimeout = setTimeout(() => {
          this.reviewsIsTouching = false;
        }, 1500);
      }, { passive: true });

      const tick = () => {
        const el = document.querySelector('.reviews-slider-container') as HTMLElement | null;
        if (!el) {
          this.reviewsScrollRaf = requestAnimationFrame(tick);
          return;
        }
        if (this.reviewsIsTouching) {
          this.reviewsScrollRaf = requestAnimationFrame(tick);
          return;
        }
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) {
          this.reviewsScrollRaf = requestAnimationFrame(tick);
          return;
        }
        const half = el.scrollWidth / 2;
        let pos = el.scrollLeft + scrollSpeed;
        if (pos >= half) pos = 0;
        el.scrollLeft = pos;
        this.reviewsScrollRaf = requestAnimationFrame(tick);
      };
      this.reviewsScrollRaf = requestAnimationFrame(tick);
    };

    setTimeout(afterLoad, 500);
  }

  /** Desktop: click-and-drag reviews */
  private initDesktopReviewsDrag(): void {
    if (typeof window === 'undefined' || window.innerWidth <= 768) return;

    const container = document.querySelector('.reviews-slider-container') as HTMLElement | null;
    if (!container) return;
    if ((container as any).__reviewsDragInit) return;
    (container as any).__reviewsDragInit = true;

    container.style.cursor = 'grab';
    container.style.scrollBehavior = 'auto';

    const images = container.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) return;
      this.reviewsIsMouseDown = true;
      this.reviewsHasDragged = false;
      const rect = container.getBoundingClientRect();
      this.reviewsStartX = e.clientX - rect.left;
      this.reviewsScrollLeftStart = container.scrollLeft;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    };

    const handleMouseUp = () => {
      this.reviewsIsMouseDown = false;
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!this.reviewsIsMouseDown) return;
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const walk = (x - this.reviewsStartX) * 1.5;
        if (Math.abs(walk) > 5) {
          this.reviewsHasDragged = true;
        }
        const maxScroll = container.scrollWidth - container.clientWidth;
        const newScroll = Math.max(0, Math.min(maxScroll, this.reviewsScrollLeftStart - walk));
        container.scrollLeft = newScroll;
    };

    const handleClick = (e: MouseEvent) => {
      if (this.reviewsHasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    container.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    container.addEventListener('mouseleave', handleMouseUp);
    container.addEventListener('click', handleClick, true);
  }
}
