# 🌌 Amyal Angular - Exhibition Stand Builder

A modern, stunning Angular 17+ application showcasing exhibition stand building services with a beautiful galaxy theme, smooth animations, and multilingual support (English & Arabic).

## ✨ Features

### 🚀 Modern Angular 17+ Architecture
- **Standalone Components** - No NgModule required
- **Signals** - Reactive state management with Angular Signals
- **New Control Flow** - Using `@if`, `@for` instead of `*ngIf`, `*ngFor`
- **TypeScript** - Fully typed for better development experience
- **HttpClient** with Fetch API

### 🎨 Beautiful UI/UX
- **Galaxy Theme** with cosmic colors (pink, purple, blue gradients)
- **Animated Starry Background** with twinkling stars
- **Neon Flowing Lines** across the navbar
- **Glowing Effects** on logo, buttons, and interactive elements
- **3D Logo** with pulsing glow animation
- **Smooth Scroll Animations** and parallax effects

### 🌍 Multilingual Support
- **English** and **Arabic** languages
- **RTL Support** for Arabic
- Smooth language switching with fade transitions
- All text elements are translatable via JSON files

### 📱 Responsive Design
- Fully responsive across all devices
- Mobile-friendly navigation menu
- Bootstrap 5 framework
- Touch-friendly interactions

### 🎯 Sections
1. **Navigation Bar** - Sticky navbar with language toggle
2. **Hero Section** - Animated logo with gradient text
3. **About Us** - Company info with animated stats
4. **Gallery** - Portfolio showcase with hover effects
5. **Contact** - Form with validation and social links
6. **Footer** - Clean footer with branding

## 🛠️ Technologies Used

- **Angular 17+** - Latest version with standalone components
- **TypeScript** - For type safety
- **Bootstrap 5** - Responsive framework
- **RxJS** - Reactive programming
- **Signals** - Angular's new reactivity primitive
- **HttpClient** - For API calls (translations)
- **Reactive Forms** - For form validation

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (latest version)

### Steps

1. **Navigate to the project directory:**
```bash
cd amyal-angular
```

2. **Install dependencies** (already done, but if needed):
```bash
npm install
```

3. **Start the development server:**
```bash
ng serve
```

4. **Open your browser and navigate to:**
```
http://localhost:4200
```

## 🎮 Available Commands

### Development Server
```bash
ng serve
```
Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build for Production
```bash
ng build
```
The build artifacts will be stored in the `dist/` directory.

### Run Tests
```bash
ng test
```

### Code Linting
```bash
ng lint
```

## 📁 Project Structure

```
amyal-angular/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── navbar/          # Navigation component
│   │   │   ├── hero/            # Hero section
│   │   │   ├── about/           # About Us section
│   │   │   ├── gallery/         # Gallery section
│   │   │   ├── contact/         # Contact form
│   │   │   └── footer/          # Footer component
│   │   ├── services/
│   │   │   └── language.service.ts  # Language/Translation service
│   │   ├── app.ts               # Main app component
│   │   ├── app.html             # Main app template
│   │   ├── app.config.ts        # App configuration
│   │   └── app.routes.ts        # Routing configuration
│   ├── assets/
│   │   ├── images/              # Images and logos
│   │   └── i18n/                # Translation files
│   │       ├── en.json          # English translations
│   │       └── ar.json          # Arabic translations
│   ├── styles.css               # Global styles (Galaxy theme)
│   └── index.html               # Main HTML file
├── angular.json                 # Angular configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## 🌐 Language Support

### Switching Languages
Click the language toggle button in the navbar (top right) to switch between English (EN) and Arabic (العربية).

### Adding New Languages
1. Create a new JSON file in `src/assets/i18n/` (e.g., `fr.json`)
2. Copy the structure from `en.json`
3. Translate all text values
4. Update the `language.service.ts` to include the new language

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `src/styles.css`:
```css
:root {
    --pink: #FF1B9E;
    --purple: #9333EA;
    --blue: #3B82F6;
    /* ... more colors */
}
```

### Modifying Content
- **Text Content**: Edit JSON files in `src/assets/i18n/`
- **Images**: Replace images in `src/assets/images/`
- **Styles**: Modify `src/styles.css` for global styles
- **Component Styles**: Edit individual component CSS files

## 🚀 Deployment

### Build for Production
```bash
ng build --configuration production
```

### Deploy to Popular Platforms

#### Netlify
```bash
npm install -g netlify-cli
ng build --configuration production
netlify deploy --prod --dir=dist/amyal-angular/browser
```

#### Vercel
```bash
npm install -g vercel
ng build --configuration production
vercel --prod
```

#### Firebase Hosting
```bash
npm install -g firebase-tools
ng build --configuration production
firebase deploy
```

## 📝 Key Components Explained

### Language Service (Signals-based)
The `LanguageService` uses Angular Signals for reactive state management:
- `currentLang()` - Returns current language
- `translations()` - Returns translation object
- `languageButtonText()` - Computed signal for button text
- `toggleLanguage()` - Switch between languages

### Standalone Components
All components are standalone (no NgModule needed):
```typescript
@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar { }
```

### New Control Flow Syntax
Using Angular 17+ control flow:
```html
@if (condition) {
  <div>Content</div>
}

@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}
```

## 🔧 Troubleshooting

### Bootstrap Not Loading
Make sure `angular.json` includes Bootstrap in styles and scripts:
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

### Translation Files Not Found
Ensure JSON files exist in `src/assets/i18n/` and the path is correct in `angular.json`:
```json
"assets": [
  "src/assets"
]
```

### Animations Not Working
Clear browser cache and restart the dev server:
```bash
ng serve --poll=2000
```

## 🌟 Performance Tips

- Images are loaded with lazy loading
- Debounced scroll events for smooth performance
- Optimized animations with CSS transforms
- Signals for efficient reactivity

## 📄 License

This project is for demonstration purposes. Customize as needed for your use case.

## 🤝 Contributing

Feel free to fork and enhance this project!

## 📧 Contact

**Amyal - Exhibition Stand Builder**

For inquiries, refer to the contact section in the application.

---

**Built with 🌌 Angular 17+ and modern web technologies!**

*Last Updated: January 2026*
