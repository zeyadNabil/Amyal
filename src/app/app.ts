import { Component, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { BackToTop } from './components/back-to-top/back-to-top';
import { ChatWidget } from './components/chat-widget/chat-widget';
import { ThemeService } from './services/theme.service';
import { ImageManagerService } from './services/image-manager.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    Navbar,
    Footer,
    BackToTop,
    ChatWidget
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  title = 'amyal-angular';
  private scrollTimeout: any;
  private ticking = false;
  private lastScale = 1;
  private zoomTimeout: any;
  private isZooming = false;

  constructor(
    private imageManager: ImageManagerService,
    private themeService: ThemeService,
    private router: Router
  ) {
    // Theme service will auto-load on construction
  }

  @HostListener('window:resize')
  onResize() {
    // Detect zoom changes on mobile
    if (typeof window !== 'undefined' && window.visualViewport) {
      const currentScale = window.visualViewport.scale || 1;
      
      if (Math.abs(currentScale - this.lastScale) > 0.01) {
        // Zoom detected - freeze interactions temporarily
        this.isZooming = true;
        document.body.classList.add('zooming');
        
        clearTimeout(this.zoomTimeout);
        this.zoomTimeout = setTimeout(() => {
          this.isZooming = false;
          document.body.classList.remove('zooming');
          this.lastScale = currentScale;
          
          // Request memory cleanup after zoom
          this.requestMemoryCleanup();
        }, 300);
      }
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    // Don't process scroll events during zoom
    if (this.isZooming) return;
    
    // Use requestAnimationFrame to throttle scroll events efficiently
    if (!this.ticking && typeof document !== 'undefined') {
      window.requestAnimationFrame(() => {
        document.body.classList.add('scrolling');
        this.ticking = false;
      });
      this.ticking = true;
      
      // Remove class after scrolling stops (increased delay for stability)
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
      }, 200);
    }
  }

  ngOnInit(): void {
    // Ensure stars are continuously visible
    this.ensureStarsCoverage();
    
    // Track route changes to hide neon wave on home page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (typeof document !== 'undefined') {
        if (event.urlAfterRedirects === '/' || event.url === '/') {
          document.body.classList.add('on-home-page');
        } else {
          document.body.classList.remove('on-home-page');
        }
      }
    });
    
    // Set initial state
    if (typeof document !== 'undefined' && this.router.url === '/') {
      document.body.classList.add('on-home-page');
    }
  }

  ngAfterViewInit(): void {
    // Double-check stars coverage after view init
    setTimeout(() => {
      this.ensureStarsCoverage();
    }, 100);
  }

  private requestMemoryCleanup(): void {
    // Force garbage collection hint for browsers that support it
    if (typeof window !== 'undefined') {
      if ((window as any).gc) {
        try {
          (window as any).gc();
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Trigger a microtask to allow cleanup
      Promise.resolve().then(() => {
        // Empty promise to trigger GC opportunity
      });
    }
  }

  ngOnDestroy(): void {
    // Cleanup
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    if (this.zoomTimeout) {
      clearTimeout(this.zoomTimeout);
    }
    if (typeof document !== 'undefined') {
      document.body.classList.remove('scrolling', 'zooming', 'on-home-page');
    }
  }

  private ensureStarsCoverage(): void {
    const starsContainer = document.querySelector('.stars-background');
    if (!starsContainer) return;

    // Check viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ensure stars cover at least 3x viewport height for continuous scrolling
    const minCoverage = Math.max(viewportHeight * 3, 3000);

    // Update each star layer to ensure coverage
    const starLayers = ['#stars', '#stars2', '#stars3'];
    starLayers.forEach((layerId, index) => {
      const layer = document.querySelector(layerId) as HTMLElement;
      if (layer) {
        // Force height to ensure coverage
        layer.style.height = `${minCoverage}px`;
        // Reset animation to ensure continuous loop
        layer.style.animation = 'none';
        setTimeout(() => {
          const durations = ['100s', '150s', '200s'];
          layer.style.animation = `animateStars ${durations[index]} linear infinite`;
        }, 10);
      }
    });
  }
}
