// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'task-form',
    loadComponent: () => import('./pages/task-form.component').then(m => m.TaskFormComponent)
  },
  {
    path: 'task-form/:id',
    loadComponent: () => import('./pages/task-form.component').then(m => m.TaskFormComponent)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];