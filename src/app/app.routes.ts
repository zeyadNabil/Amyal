import { Routes } from '@angular/router';
import { Services } from './components/services/services';
import { Home } from './components/home/home';
import { Gallery } from './components/gallery/gallery';
import { AboutUs } from './components/about-us/about-us';
import { ContactUs } from './components/contact-us/contact-us';
import { Partners } from './components/partners/partners';
import { Admin } from './components/admin/admin';
import { AddReview } from './components/add-review/add-review';
import { ReviewDetail } from './components/review-detail/review-detail';

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
    path: 'x7k2m9qp3vn8wj4',
    component: Admin
  },
  {
    path: 'add-review',
    component: AddReview
  },
  {
    path: 'review/:id',
    component: ReviewDetail
  },
  {
    path: '**',
    redirectTo: ''
  }
];
