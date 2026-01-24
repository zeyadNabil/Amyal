import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { BackToTop } from './components/back-to-top/back-to-top';
import { ChatWidget } from './components/chat-widget/chat-widget';

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
export class App implements OnInit, AfterViewInit {
  title = 'amyal-angular';

  ngOnInit(): void {
    // Ensure stars are continuously visible
    this.ensureStarsCoverage();
  }

  ngAfterViewInit(): void {
    // Double-check stars coverage after view init
    setTimeout(() => {
      this.ensureStarsCoverage();
    }, 100);
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
