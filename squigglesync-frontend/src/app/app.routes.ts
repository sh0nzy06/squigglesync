import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'ui/whiteboard',
    loadComponent: () => import('./ui/whiteboard-mock/whiteboard-mock.component').then(m => m.WhiteboardMockComponent)
  },
  {
    path: '',
    redirectTo: 'ui/whiteboard',
    pathMatch: 'full'
  }
];
