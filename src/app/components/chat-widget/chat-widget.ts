import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';

export type PhoneOptionId = 'uae' | 'usa';

export interface PhoneOption {
  id: PhoneOptionId;
  number: string;
  labelKey: string; // e.g. 'contact.uae', 'contact.usa'
}

@Component({
  selector: 'app-chat-widget',
  imports: [CommonModule, RouterModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css'
})
export class ChatWidget implements OnInit {
  isOpen = signal(false);
  /** Which number is selected for WhatsApp (default UAE) */
  selectedPhone = signal<PhoneOptionId>('uae');

  phoneOptions: PhoneOption[] = [
    { id: 'uae', number: '+971 50 461 2803', labelKey: 'contact.uae' },
    { id: 'usa', number: '+1 407-927-7483', labelKey: 'contact.usa' }
  ];

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

  selectNumber(id: PhoneOptionId): void {
    this.selectedPhone.set(id);
  }

  /** Digits only for WhatsApp URL (no +, spaces, or dashes) */
  getNumberForWhatsApp(number: string): string {
    return number.replace(/\D/g, '');
  }

  /**
   * WhatsApp URL that opens the chat for the selected number.
   * - Desktop: opens WhatsApp Desktop app if installed, otherwise WhatsApp Web.
   * - Mobile: opens WhatsApp app if installed, otherwise web; app is preferred.
   * Using wa.me lets the OS/browser choose app vs web.
   */
  getWhatsAppUrl(): string {
    const selected = this.phoneOptions.find(o => o.id === this.selectedPhone());
    const num = selected ? this.getNumberForWhatsApp(selected.number) : this.getNumberForWhatsApp(this.phoneOptions[0].number);
    return `https://wa.me/${num}`;
  }

  sendWhatsAppMessage(): void {
    window.open(this.getWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  }

  navigateToContact(): void {
    this.closeChat();
  }

  getPhoneLink(number: string): string {
    return 'tel:' + number.replace(/[-\s]/g, '');
  }
}
