import { Routes } from '@angular/router';
import { Services } from './components/services/services';
import { Home } from './components/home/home';
import { Gallery } from './components/gallery/gallery';

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
    path: '**',
    redirectTo: ''
  }
];
