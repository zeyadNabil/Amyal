import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageManagerService {
  private loadedImages = new Map<string, HTMLImageElement>();
  private observer: IntersectionObserver | null = null;
  private maxConcurrentLoads = 6;
  private currentLoads = 0;
  private loadQueue: Array<{ img: HTMLImageElement; src: string; resolve: () => void }> = [];
  
  // Track memory pressure
  private isLowMemory = signal(false);

  constructor() {
    this.initIntersectionObserver();
    this.monitorMemory();
  }

  private initIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const img = entry.target as HTMLImageElement;
          
          if (entry.isIntersecting) {
            // Image is visible - load it
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc && !img.src) {
              this.loadImage(img, dataSrc);
            }
          } else if (entry.intersectionRatio === 0) {
            // Image is far off screen - unload it to save memory
            if (this.isLowMemory() && img.src && !img.hasAttribute('data-keep')) {
              img.setAttribute('data-src', img.src);
              img.src = '';
              this.loadedImages.delete(img.src);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Load images 50px before they enter viewport
        threshold: 0
      }
    );
  }

  observeImage(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(img);
    }
  }

  unobserveImage(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.unobserve(img);
    }
  }

  private loadImage(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise((resolve) => {
      // Check if already loaded
      if (this.loadedImages.has(src)) {
        img.src = src;
        resolve();
        return;
      }

      // Add to queue if too many concurrent loads
      if (this.currentLoads >= this.maxConcurrentLoads) {
        this.loadQueue.push({ img, src, resolve });
        return;
      }

      this.currentLoads++;
      const tempImg = new Image();
      
      tempImg.onload = () => {
        img.src = src;
        this.loadedImages.set(src, tempImg);
        this.currentLoads--;
        this.processQueue();
        resolve();
      };

      tempImg.onerror = () => {
        this.currentLoads--;
        this.processQueue();
        resolve();
      };

      tempImg.src = src;
    });
  }

  private processQueue(): void {
    if (this.loadQueue.length > 0 && this.currentLoads < this.maxConcurrentLoads) {
      const next = this.loadQueue.shift();
      if (next) {
        this.loadImage(next.img, next.src).then(next.resolve);
      }
    }
  }

  private monitorMemory(): void {
    if (typeof window === 'undefined') return;

    // Check if device has limited memory
    const memory = (performance as any).memory;
    if (memory) {
      // Check memory every 2 seconds
      setInterval(() => {
        const usedMemoryPercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        this.isLowMemory.set(usedMemoryPercentage > 70);
        
        // If memory is critical, clear some loaded images
        if (usedMemoryPercentage > 85) {
          this.clearUnusedImages();
        }
      }, 2000);
    }
  }

  private clearUnusedImages(): void {
    // Clear images that aren't currently visible
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img: any) => {
      if (img.src && !this.isImageInViewport(img)) {
        img.setAttribute('data-src', img.src);
        img.src = '';
      }
    });
    
    // Clear half of the loaded images cache
    const entries = Array.from(this.loadedImages.entries());
    const toRemove = entries.slice(0, Math.floor(entries.length / 2));
    toRemove.forEach(([key]) => this.loadedImages.delete(key));
  }

  private isImageInViewport(img: HTMLElement): boolean {
    const rect = img.getBoundingClientRect();
    return (
      rect.top >= -100 &&
      rect.left >= -100 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 100 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + 100
    );
  }

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.loadedImages.clear();
    this.loadQueue = [];
  }
}
