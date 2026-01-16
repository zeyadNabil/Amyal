import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { BackToTop } from './components/back-to-top/back-to-top';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    Navbar,
    Footer,
    BackToTop
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'amyal-angular';
}
