import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Theme, SavedTheme } from '../models/api.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private apiUrl = '/api';
  currentTheme = signal<Theme | null>(null);
  savedThemes = signal<SavedTheme[]>([]);

  constructor(private http: HttpClient) {
    this.loadTheme();
  }

  async loadTheme(): Promise<void> {
    try {
      const theme = await firstValueFrom(
        this.http.get<Theme>(`${this.apiUrl}/theme`)
      );
      this.currentTheme.set(theme);
      this.applyTheme(theme);
    } catch {
      // API unavailable (e.g. dev without backend) - use default theme so app works
      const defaultTheme = this.getDefaultTheme();
      this.currentTheme.set(defaultTheme);
      this.applyTheme(defaultTheme);
    }
  }

  async loadSavedThemes(): Promise<void> {
    try {
      const list = await firstValueFrom(
        this.http.get<SavedTheme[]>(`${this.apiUrl}/theme?list=presets`)
      );
      this.savedThemes.set(Array.isArray(list) ? list : []);
    } catch {
      this.savedThemes.set([]);
    }
  }

  async saveThemePreset(name: string, theme: Theme, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean }>(`${this.apiUrl}/theme`, {
          action: 'save',
          name: name.trim(),
          theme,
          password
        })
      );
      if (response?.success) {
        await this.loadSavedThemes();
        return { success: true };
      }
      return { success: false, error: 'Failed to save theme' };
    } catch (error: unknown) {
      const err = error as { status?: number };
      return {
        success: false,
        error: err?.status === 401 ? 'Invalid password' : 'Failed to save theme preset'
      };
    }
  }

  async applyThemePreset(id: string, password: string): Promise<{ success: boolean; theme?: Theme; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; theme: Theme }>(`${this.apiUrl}/theme`, {
          action: 'apply',
          id,
          password
        })
      );
      if (response?.success && response.theme) {
        this.currentTheme.set(response.theme);
        this.applyTheme(response.theme);
        return { success: true, theme: response.theme };
      }
      return { success: false, error: 'Failed to apply theme' };
    } catch (error: unknown) {
      const err = error as { status?: number };
      return {
        success: false,
        error: err?.status === 401 ? 'Invalid password' : err?.status === 404 ? 'Theme not found' : 'Failed to apply theme'
      };
    }
  }

  private hexToRgb(hex: string): string {
    const m = hex.replace(/^#/, '').match(/(.{2})/g);
    if (!m) return '2, 125, 248';
    return m.map((x) => parseInt(x, 16)).join(', ');
  }

  applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-rgb', this.hexToRgb(theme.primaryColor));
    root.style.setProperty('--secondary-rgb', this.hexToRgb(theme.secondaryColor));
    root.style.setProperty('--accent-rgb', this.hexToRgb(theme.accentColor));

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
    
    root.style.setProperty('--bg-dark', theme.backgroundColor);
    root.style.setProperty('--white', theme.textColor);

    // Advanced mode only
    if (theme.borderColor) root.style.setProperty('--border-color', theme.borderColor);
    if (theme.backgroundColorDarker) root.style.setProperty('--bg-darker', theme.backgroundColorDarker);
    if (theme.backgroundColorNavy) root.style.setProperty('--bg-navy', theme.backgroundColorNavy);
    if (theme.mutedTextColor) root.style.setProperty('--gray', theme.mutedTextColor);
    if (theme.linkColor) root.style.setProperty('--link-color', theme.linkColor);
    if (theme.cardBorderColor) root.style.setProperty('--card-border-color', theme.cardBorderColor);
    
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
      .gradient-text-animated,
      .section-title.gradient-text-animated,
      .section-title.gradient-text,
      .section-main-title.gradient-text-animated,
      .about-title.gradient-text-animated,
      .service-title.gradient-text-animated,
      .partners-title.gradient-text-animated,
      .gallery-title.gradient-text-animated {
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
        this.http.post<{ success: boolean; theme: Theme }>(`${this.apiUrl}/theme`, {
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
    return {
      primaryColor: '#0E37AD',
      secondaryColor: '#027DF8',
      accentColor: '#60CEFE',
      backgroundColor: '#0a0e1a',
      textColor: '#FFFFFF',
      gradientStart: '#0E37AD',
      gradientEnd: '#60CEFE',
      borderColor: '#1e293b',
      backgroundColorDarker: '#050810',
      backgroundColorNavy: '#141824',
      mutedTextColor: '#94A3B8',
      linkColor: '#60CEFE',
      cardBorderColor: '#334155'
    };
  }
}
