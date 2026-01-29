import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ShimmerLayout =
  | 'hero'
  | 'grid'
  | 'list'
  | 'cards'
  | 'full-page'
  | 'contact-form'
  | 'gallery'
  | 'services';

@Component({
  selector: 'app-shimmer-loader',
  imports: [CommonModule],
  templateUrl: './shimmer-loader.html',
  styleUrl: './shimmer-loader.css'
})
export class ShimmerLoader {
  @Input() layout: ShimmerLayout = 'full-page';
  @Input() isLoading: boolean = true;
  @Input() itemCount: number = 6;

  get arrayFromCount(): number[] {
    return Array(this.itemCount).fill(0).map((_, i) => i);
  }
}
