import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { Home } from './components/home/home';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    Navbar,
    Home,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'amyal-angular';
}
