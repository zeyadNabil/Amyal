import { Component, OnInit, OnDestroy, HostListener, signal, computed } from '@angular/core';
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
export class ReviewsSlider implements OnInit, OnDestroy {
  // Use computed signal that automatically updates when service reviews change
  reviews = computed(() => this.reviewService.reviews().filter(r => r.approved));
  
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
  private reviewsRtlUsesNegativeScroll: boolean | null = null;
  private reviewsLastDir: 'ltr' | 'rtl' | null = null;

  constructor(
    public reviewService: ReviewService,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    // Reviews are now loaded automatically by the service
    // and updates via computed signal
    this.initMobileReviewsSlider();
    this.initDesktopReviewsDrag();
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

      const getScrollPosition = (el: HTMLElement): number => {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return 0;
        const left = el.scrollLeft;
        const isRtl = this.reviewsLastDir === 'rtl';
        if (!isRtl) return left;
        if (this.reviewsRtlUsesNegativeScroll === true) return -left;
        if (this.reviewsRtlUsesNegativeScroll === false) return left;
        return left <= 0 ? -left : left;
      };

      const setScrollPosition = (el: HTMLElement, pos: number): void => {
        const maxScroll = el.scrollWidth - el.clientWidth;
        const isRtl = this.reviewsLastDir === 'rtl';
        if (!isRtl) {
          el.scrollLeft = pos;
          return;
        }
        if (this.reviewsRtlUsesNegativeScroll === true) {
          el.scrollLeft = -pos;
          return;
        }
        if (this.reviewsRtlUsesNegativeScroll === false) {
          el.scrollLeft = pos;
          return;
        }
        el.scrollLeft = -pos;
        if (el.scrollLeft <= -1) this.reviewsRtlUsesNegativeScroll = true;
        else {
          el.scrollLeft = pos;
          this.reviewsRtlUsesNegativeScroll = false;
        }
      };

      const tick = () => {
        const el = document.querySelector('.reviews-slider-container') as HTMLElement | null;
        if (!el) {
          this.reviewsScrollRaf = requestAnimationFrame(tick);
          return;
        }
        const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
        const currentDir = isRtl ? 'rtl' : 'ltr';
        if (this.reviewsLastDir !== currentDir) {
          this.reviewsLastDir = currentDir;
          this.reviewsRtlUsesNegativeScroll = isRtl ? null : false;
        }
        if (this.reviewsIsTouching) {
          this.reviewsScrollRaf = requestAnimationFrame(tick);
          return;
        }
        const half = el.scrollWidth / 2;
        let pos = getScrollPosition(el);
        pos += scrollSpeed;
        if (pos >= half) pos = 0;
        setScrollPosition(el, pos);
        this.reviewsScrollRaf = requestAnimationFrame(tick);
      };
      this.reviewsScrollRaf = requestAnimationFrame(tick);
    };

    setTimeout(afterLoad, 500);
  }

  /** Desktop: click-and-drag reviews */
  private initDesktopReviewsDrag(): void {
    if (typeof window === 'undefined' || window.innerWidth <= 768) return;

    const afterLoad = () => {
      const container = document.querySelector('.reviews-slider-container') as HTMLElement | null;
      if (!container) return;

      container.style.cursor = 'grab';
      container.style.scrollBehavior = 'auto';

      const images = container.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
      });

      const handleMouseDown = (e: MouseEvent) => {
        this.reviewsIsMouseDown = true;
        this.reviewsHasDragged = false;
        this.reviewsStartX = e.pageX - container.offsetLeft;
        this.reviewsScrollLeftStart = container.scrollLeft;
        container.style.cursor = 'grabbing';
        container.style.userSelect = 'none';
      };

      const handleMouseLeave = () => {
        this.reviewsIsMouseDown = false;
        container.style.cursor = 'grab';
        container.style.userSelect = '';
      };

      const handleMouseUp = () => {
        this.reviewsIsMouseDown = false;
        container.style.cursor = 'grab';
        container.style.userSelect = '';
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!this.reviewsIsMouseDown) return;
        e.preventDefault();
        
        const x = e.pageX - container.offsetLeft;
        const walk = (x - this.reviewsStartX) * 1.5;
        
        if (Math.abs(walk) > 5) {
          this.reviewsHasDragged = true;
        }
        
        container.scrollLeft = this.reviewsScrollLeftStart - walk;
      };

      const handleClick = (e: MouseEvent) => {
        if (this.reviewsHasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('click', handleClick, true);
    };

    setTimeout(afterLoad, 500);
  }
}
