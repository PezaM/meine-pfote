import { inject } from '@angular/core';
import type { CanActivateFn, Routes } from '@angular/router';
import { Router } from '@angular/router';

import { animalDetailGuard } from './guards/animal-detail.guard';
import { driverAssignmentGuard } from './guards/driver-assignment.guard';
import { fosterHomeGuard } from './guards/foster-home.guard';
import { notificationGuard } from './guards/notification.guard';
import { permissionGuard } from './guards/permission.guard';
import { roleGuard } from './guards/role.guard';
import { AuthService } from './services/auth.service';

const authenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService).isLoggedIn() || router.createUrlTree(['/login']);
};

const unauthenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  return !inject(AuthService).isLoggedIn() || router.createUrlTree(['/home']);
};

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [unauthenticatedGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'home',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        canActivate: [permissionGuard('dashboard')],
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'animals',
        canActivate: [permissionGuard('animals')],
        data: { area: 'animals', title: 'Tiere' },
        loadComponent: () => import('./pages/animals/animals.page').then((m) => m.AnimalsPage),
      },
      {
        path: 'animal-create',
        canActivate: [roleGuard(['board'])],
        data: { create: true },
        loadComponent: () => import('./pages/animal-detail/animal-detail.page').then((m) => m.AnimalDetailPage),
      },
      {
        path: 'animal-details/:id',
        canActivate: [animalDetailGuard],
        data: { area: 'animal-details', title: 'Tierdetails' },
        loadComponent: () => import('./pages/animal-detail/animal-detail.page').then((m) => m.AnimalDetailPage),
      },
      {
        path: 'foster-homes',
        canActivate: [permissionGuard('foster-homes')],
        data: { area: 'foster-homes', view: 'list' },
        loadComponent: () => import('./pages/foster-homes/foster-homes.page').then((m) => m.FosterHomesPage),
      },
      {
        path: 'my-foster-home',
        canActivate: [permissionGuard('foster-homes'), roleGuard(['foster'])],
        data: { view: 'profile' },
        loadComponent: () => import('./pages/foster-homes/foster-homes.page').then((m) => m.FosterHomesPage),
      },
      {
        path: 'foster-home-create',
        canActivate: [roleGuard(['board'])],
        data: { view: 'create' },
        loadComponent: () => import('./pages/foster-homes/foster-homes.page').then((m) => m.FosterHomesPage),
      },
      {
        path: 'foster-homes/:id',
        canActivate: [fosterHomeGuard],
        data: { view: 'detail' },
        loadComponent: () => import('./pages/foster-homes/foster-homes.page').then((m) => m.FosterHomesPage),
      },
      {
        path: 'costs',
        canActivate: [permissionGuard('costs')],
        data: { area: 'costs' },
        loadComponent: () => import('./pages/costs/costs.page').then((m) => m.CostsPage),
      },
      {
        path: 'receipts',
        canActivate: [permissionGuard('receipts')],
        data: { area: 'receipts' },
        loadComponent: () => import('./pages/costs/costs.page').then((m) => m.CostsPage),
      },
      {
        path: 'reports',
        canActivate: [permissionGuard('reports')],
        loadComponent: () => import('./pages/reports/reports.page').then((m) => m.ReportsPage),
      },
      {
        path: 'notifications',
        canActivate: [permissionGuard('notifications')],
        loadComponent: () => import('./pages/notifications/notifications.page').then((m) => m.NotificationsPage),
      },
      {
        path: 'notifications/:id',
        canActivate: [notificationGuard],
        loadComponent: () => import('./pages/notifications/notifications.page').then((m) => m.NotificationsPage),
      },
      {
        path: 'driver-assignments',
        canActivate: [permissionGuard('driver-assignments')],
        data: { view: 'list' },
        loadComponent: () =>
          import('./pages/driver-assignments/driver-assignments.page').then((m) => m.DriverAssignmentsPage),
      },
      {
        path: 'driver-assignments/:id',
        canActivate: [driverAssignmentGuard],
        data: { view: 'detail' },
        loadComponent: () =>
          import('./pages/driver-assignments/driver-assignments.page').then((m) => m.DriverAssignmentsPage),
      },
      {
        path: 'profile',
        canActivate: [permissionGuard('profile')],
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'more',
        canActivate: [roleGuard(['board'])],
        loadComponent: () => import('./pages/more/more.page').then((m) => m.MorePage),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
