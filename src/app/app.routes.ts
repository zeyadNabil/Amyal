import { Routes } from '@angular/router';
import { Services } from './components/services/services';
import { Home } from './components/home/home';
import { Gallery } from './components/gallery/gallery';
import { AboutUs } from './components/about-us/about-us';
import { ContactUs } from './components/contact-us/contact-us';
import { Partners } from './components/partners/partners';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'services/:id',
    component: Services
  },
  {
    path: 'gallery',
    component: Gallery
  },
  {
    path: 'about-us',
    component: AboutUs
  },
  {
    path: 'contact-us',
    component: ContactUs
  },
  {
    path: 'partners',
    component: Partners
  },
  {
    path: '**',
    redirectTo: ''
  }
];
