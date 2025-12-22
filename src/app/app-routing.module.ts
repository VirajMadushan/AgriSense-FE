import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layouts
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';

// Guards
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';


const routes: Routes = [
  // ==========================
  // PUBLIC ROUTES (Login first)
  // ==========================
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-login/auth-login.component')
            .then(c => c.AuthLoginComponent)
      }
    ]
  },

  // ==========================
  // PROTECTED ROUTES
  // ==========================
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard/admin-dashboard',
        loadComponent: () =>
          import('./dashboards/admin-dashboard/admin-dashboard.component')
            .then(c => c.AdminDashboardComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'dashboard/user-dashboard',
        loadComponent: () =>
          import('./dashboards/user-dashboard/user-dashboard.component')
            .then(c => c.UserDashboardComponent)
      },

      {
        path: 'typography',
        loadComponent: () =>
          import('./demo/component/basic-component/typography/typography.component')
            .then(c => c.TypographyComponent)
      },

      {
        path: 'users',
        loadComponent: () =>
          import('./demo/component/basic-component/users/users.component')
            .then(c => c.UsersComponent),
        canActivate: [adminGuard]
      },

      {
        path: 'device-management',
        loadComponent: () =>
          import('./demo/component/basic-component/device-management/device-management.component')
            .then(c => c.DeviceManagementComponent),
        canActivate: [adminGuard]
      },

      {
        path: 'color',
        loadComponent: () =>
          import('./demo/component/basic-component/color/color.component')
            .then(c => c.ColorComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () =>
          import('./demo/others/sample-page/sample-page.component')
            .then(c => c.SamplePageComponent)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./demo/component/basic-component/analytics/analytics.component')
            .then(c => c.AnalyticsComponent)
      },
      {
        path: 'monitoring',
        loadComponent: () =>
          import('./demo/component/basic-component/monitoring/monitoring.component')
            .then(c => c.MonitoringComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./demo/component/basic-component/profile/profile.component')
            .then(c => c.ProfileComponent)
      }
    ]
  },

  // ==========================
  // CATCH ALL
  // ==========================
  { path: '**', redirectTo: 'login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
