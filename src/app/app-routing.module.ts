import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layouts
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';


// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [

  // ==========================
  // PROTECTED ROUTES (LOGGED IN USERS)
  // ==========================
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [AuthGuard],
    children: [

      // Redirect based on role (frontend)
      { path: '', redirectTo: 'dashboard/user-dashboard', pathMatch: 'full' },

      // -------------------------
      // ADMIN DASHBOARD
      // -------------------------
      {
        path: 'dashboard/admin-dashboard',
        loadComponent: () =>
          import('./dashboards/admin-dashboard/admin-dashboard.component')
            .then(c => c.AdminDashboardComponent),
        canActivate: [AdminGuard]
      },

      // -------------------------
      // USER DASHBOARD
      // -------------------------
      {
        path: 'dashboard/user-dashboard',
        loadComponent: () =>
          import('./dashboards/user-dashboard/user-dashboard.component')
            .then(c => c.UserDashboardComponent)
      },

      // Your other existing pages
      {
        path: 'typography',
        loadComponent: () => import('./demo/component/basic-component/typography/typography.component')
          .then(c => c.TypographyComponent)
      },
      {
        path: 'devices',
        loadComponent: () => import('./demo/component/basic-component/devices/devices.component')
          .then(c => c.DevicesComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/component/basic-component/color/color.component')
          .then(c => c.ColorComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component')
          .then(c => c.SamplePageComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./demo/component/basic-component/analytics/analytics.component')
          .then(c => c.AnalyticsComponent)
      },
      {
        path: 'monitoring',
        loadComponent: () => import('./demo/component/basic-component/monitoring/monitoring.component')
          .then(c => c.MonitoringComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./demo/component/basic-component/profile/profile.component')
          .then(c => c.ProfileComponent)
      }
    ]
  },

  // ==========================
  // PUBLIC ROUTES
  // ==========================
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-login/auth-login.component')
            .then(c => c.AuthLoginComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
