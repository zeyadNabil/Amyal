import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-chat-widget',
  imports: [CommonModule, RouterModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css'
})
export class ChatWidget implements OnInit {
  isOpen = signal(false);
  phoneNumberUAE = '+971 50 461 2803';
  phoneNumberUSA = '+1 407-927-7483';

  constructor(public langService: LanguageService) {}

  ngOnInit(): void {
    // Component initialization
  }

  toggleChat(): void {
    this.isOpen.set(!this.isOpen());
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  navigateToContact(): void {
    this.closeChat();
    // Navigation will be handled by routerLink in template
  }

  getPhoneLinkUAE(): string {
    return 'tel:' + this.phoneNumberUAE.replace(/[-\s]/g, '');
  }

  getPhoneLinkUSA(): string {
    return 'tel:' + this.phoneNumberUSA.replace(/[-\s]/g, '');
  }
}
