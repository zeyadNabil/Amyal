import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Theme } from '../models/api.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private apiUrl = '/api';
  currentTheme = signal<Theme | null>(null);

  constructor(private http: HttpClient) {
    this.loadTheme();
  }

  private isLocalDev(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  async loadTheme(): Promise<void> {
    try {
      const theme = await firstValueFrom(
        this.http.get<Theme>(`${this.apiUrl}/get-theme`)
      );
      this.currentTheme.set(theme);
      
      // Always apply the theme (whether default or customized)
      this.applyTheme(theme);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }

  applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Update primary blue (dark blue) - used for main buttons/headers
    root.style.setProperty('--blue', theme.primaryColor);
    root.style.setProperty('--blue-dark', theme.primaryColor);
    
    // Update secondary blue (mid blue) - used for accents
    root.style.setProperty('--purple', theme.secondaryColor);
    root.style.setProperty('--blue-mid', theme.secondaryColor);
    
    // Update bright cyan (bright accent) - used for highlights
    root.style.setProperty('--blue-bright', theme.accentColor);
    root.style.setProperty('--blue-light', theme.accentColor);
    root.style.setProperty('--pink', theme.accentColor);
    root.style.setProperty('--pink-light', theme.accentColor);
    root.style.setProperty('--purple-light', theme.accentColor);
    
    // Update gradients using gradientStart and gradientEnd from theme
    root.style.setProperty('--gradient-primary', 
      `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.secondaryColor} 50%, ${theme.gradientEnd} 100%)`);
    root.style.setProperty('--gradient-hero', 
      `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.secondaryColor} 50%, ${theme.gradientEnd} 100%)`);
    root.style.setProperty('--gradient-vertical', 
      `linear-gradient(180deg, ${theme.gradientStart} 0%, ${theme.secondaryColor} 50%, ${theme.gradientEnd} 100%)`);
    
    // Update gradient-blue-silver (used in some components)
    root.style.setProperty('--gradient-blue-silver',
      `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.secondaryColor} 45%, ${theme.gradientEnd} 85%, ${theme.textColor} 100%)`);
    root.style.setProperty('--gradient-text-blue-silver',
      `linear-gradient(90deg, ${theme.gradientStart} 0%, ${theme.secondaryColor} 30%, ${theme.gradientEnd} 65%, ${theme.textColor} 100%)`);
    
    // Update background
    root.style.setProperty('--bg-dark', theme.backgroundColor);
    
    // Update text color
    root.style.setProperty('--white', theme.textColor);
    
    // Update animated gradient text (used in headers)
    const animatedGradient = `linear-gradient(90deg, 
      ${theme.gradientStart} 0%, 
      ${theme.secondaryColor} 20%, 
      ${theme.gradientEnd} 40%, 
      ${theme.textColor} 50%, 
      ${theme.gradientEnd} 60%, 
      ${theme.secondaryColor} 80%, 
      ${theme.gradientStart} 100%)`;
    
    // Apply to gradient text elements dynamically
    const style = document.createElement('style');
    style.id = 'dynamic-theme-style';
    const existingStyle = document.getElementById('dynamic-theme-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    style.innerHTML = `
      .gradient-text,
      .gradient-text-animated {
        background: ${animatedGradient};
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shine 5s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }

  async updateTheme(theme: Theme, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; theme: Theme }>(`${this.apiUrl}/update-theme`, {
          ...theme,
          password
        })
      );
      
      if (response.success) {
        this.currentTheme.set(response.theme);
        this.applyTheme(response.theme);
        return { success: true };
      }
      
      return { success: false, error: 'Failed to update theme' };
    } catch (error: any) {
      console.error('Error updating theme:', error);
      return { 
        success: false, 
        error: error.status === 401 ? 'Invalid password' : 'Failed to update theme' 
      };
    }
  }

  getDefaultTheme(): Theme {
    // Match exact values from styles.css :root variables
    return {
      primaryColor: '#0E37AD',       // --blue (dark blue)
      secondaryColor: '#027DF8',     // --purple (mid blue)
      accentColor: '#60CEFE',        // --blue-bright (bright cyan blue)
      backgroundColor: '#0a0e1a',    // --bg-dark
      textColor: '#FFFFFF',          // --white (not applied unless changed)
      gradientStart: '#0E37AD',      // --blue-dark (gradient start)
      gradientEnd: '#60CEFE'         // --blue-bright (gradient end)
    };
  }
}
