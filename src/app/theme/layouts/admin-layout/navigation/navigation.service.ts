import { Injectable } from '@angular/core';
import { NavigationItem } from './navigation';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private getRole(): string {
    return (localStorage.getItem('role') || '').toLowerCase();
  }

  getMenu(): NavigationItem[] {
    const role = this.getRole();
    const isAdmin = role === 'admin';
    const isUser = role === 'user';

    const menu: NavigationItem[] = [
      // ==========================
      // DASHBOARD
      // ==========================
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'group' as const,
        icon: 'icon-navigation',
        children: [
          ...(isAdmin
            ? [
              {
                id: 'admin-dashboard',
                title: 'Admin Dashboard',
                type: 'item' as const,
                classes: 'nav-item',
                url: '/dashboard/admin-dashboard',
                icon: 'dashboard',
                breadcrumbs: false
              }
            ]
            : []),

          ...(isUser
            ? [
              {
                id: 'user-dashboard',
                title: 'My Dashboard',
                type: 'item' as const,
                classes: 'nav-item',
                url: '/dashboard/user-dashboard',
                icon: 'dashboard',
                breadcrumbs: false
              }
            ]
            : [])
        ]
      },

      // ==========================
      // SERVICES
      // ==========================
      {
        id: 'services',
        title: 'Services',
        type: 'group' as const,
        icon: 'icon-navigation',
        children: [
          {
            id: 'monitoring',
            title: 'Monitoring',
            type: 'item' as const,
            classes: 'nav-item',
            url: '/monitoring',
            icon: 'user'
          },
          {
            id: 'analytics',
            title: 'Analytics',
            type: 'item' as const,
            classes: 'nav-item',
            url: '/analytics',
            icon: 'line-chart'
          },

          ...(isAdmin
            ? [
              {
                id: 'device-management',
                title: 'Device Management',
                type: 'item' as const,
                classes: 'nav-item',
                url: '/device-management',
                icon: 'rocket'
              },
              {
                id: 'users',
                title: 'Users',
                type: 'item' as const,
                classes: 'nav-item',
                url: '/users',
                icon: 'user'
              }
            ]
            : []),

          ...(isUser
            ? [
              {
                id: 'my-devices',
                title: 'My Devices',
                type: 'item' as const,
                classes: 'nav-item',
                url: '/my-devices',
                icon: 'rocket'
              }
            ]
            : []),

          {
            id: 'ant-icons',
            title: 'Ant Icons',
            type: 'item' as const,
            classes: 'nav-item',
            url: 'https://ant.design/components/icon',
            icon: 'ant-design',
            target: true,
            external: true
          },
          {
            id: 'logout',
            title: 'Logout',
            type: 'item' as const,
            classes: 'nav-item',
            url: '/logout',
            icon: 'logout',
            breadcrumbs: false
          }


        ]
      },

      // ==========================
      // OTHER
      // ==========================
      {
        id: 'other',
        title: 'Other',
        type: 'group' as const,
        icon: 'icon-navigation',
        children: [
          {
            id: 'sample-page',
            title: 'Sample Page',
            type: 'item' as const,
            url: '/sample-page',
            classes: 'nav-item',
            icon: 'chrome'
          }
        ]
      }
    ];

    return menu;
  }
}
