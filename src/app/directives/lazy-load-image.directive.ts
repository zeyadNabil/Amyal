import { Directive, ElementRef, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ImageManagerService } from '../services/image-manager.service';

@Directive({
  selector: 'img[lazyLoad]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() lazyLoad: string = '';
  @Input() keepInMemory: boolean = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private imageManager: ImageManagerService
  ) {}

  ngOnInit(): void {
    const img = this.el.nativeElement;
    
    // Set placeholder or keep existing src
    if (this.lazyLoad && !img.src) {
      img.setAttribute('data-src', this.lazyLoad);
      // Add a tiny transparent placeholder
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    if (this.keepInMemory) {
      img.setAttribute('data-keep', 'true');
    }
  }

  ngAfterViewInit(): void {
    // Start observing for lazy loading
    this.imageManager.observeImage(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    // Stop observing when component is destroyed
    this.imageManager.unobserveImage(this.el.nativeElement);
  }
}
