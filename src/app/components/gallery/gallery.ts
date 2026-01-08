import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

interface GalleryItem {
  id: number;
  projectKey: string;
  categoryKey: string;
  image: string;
}

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery implements OnInit {
  galleryItems: GalleryItem[] = [
    { id: 1, projectKey: 'gallery.project1', categoryKey: 'gallery.category1', image: 'assets/images/homepage.jpeg' },
    { id: 2, projectKey: 'gallery.project2', categoryKey: 'gallery.category2', image: 'assets/images/homepage.jpeg' },
    { id: 3, projectKey: 'gallery.project3', categoryKey: 'gallery.category3', image: 'assets/images/homepage.jpeg' },
    { id: 4, projectKey: 'gallery.project4', categoryKey: 'gallery.category4', image: 'assets/images/homepage.jpeg' },
    { id: 5, projectKey: 'gallery.project5', categoryKey: 'gallery.category5', image: 'assets/images/homepage.jpeg' },
    { id: 6, projectKey: 'gallery.project6', categoryKey: 'gallery.category6', image: 'assets/images/homepage.jpeg' }
  ];

  constructor(public langService: LanguageService) {}

  ngOnInit(): void {
    this.initScrollAnimations();
    this.initGalleryInteractions();
  }

  initScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    setTimeout(() => {
      const revealElements = document.querySelectorAll('.scroll-reveal');
      revealElements.forEach(element => observer.observe(element));
    }, 100);
  }

  initGalleryInteractions(): void {
    setTimeout(() => {
      const galleryItems = document.querySelectorAll('.gallery-item');
      
      galleryItems.forEach(item => {
        item.addEventListener('click', (event: Event) => {
          // Add pulse animation on click
          const target = event.currentTarget as HTMLElement;
          target.style.animation = 'pulse 0.5s ease';
          setTimeout(() => {
            target.style.animation = '';
          }, 500);
        });
      });
    }, 100);
  }
}

