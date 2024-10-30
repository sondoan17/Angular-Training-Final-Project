import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { TaskDetailsComponent } from './pages/task-details/task-details.component';
import { AssignedTasksComponent } from './pages/assigned-tasks/assigned-tasks.component';
import { SearchComponent } from './pages/search/search.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'projects/:id',
    component: ProjectDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'projects/:projectId/tasks/:taskId',
    component: TaskDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'assigned-tasks',
    component: AssignedTasksComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Forgot Password'
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Reset Password'
  }
];
