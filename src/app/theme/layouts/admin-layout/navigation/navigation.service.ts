import { Injectable } from '@angular/core';
import { NavigationItem } from './navigation';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  getRole(): string {
    return (localStorage.getItem('role') || '').toLowerCase();
  }

  getMenu(): NavigationItem[] {
    const role = this.getRole();
    const isAdmin = role === 'admin';
    const isUser = role === 'user';

    const menu: NavigationItem[] = [
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

      {
        id: 'authentication',
        title: 'Authentication',
        type: 'group' as const,
        icon: 'icon-navigation',
        children: [
          {
            id: 'login',
            title: 'Login',
            type: 'item' as const,
            classes: 'nav-item',
            url: '/login',
            icon: 'login',
            target: true,
            breadcrumbs: false
          }
        ]
      },

      {
        id: 'utilities',
        title: 'Services',
        type: 'group' as const,
        icon: 'icon-navigation',
        children: [
          { id: 'monitoring', title: 'Monitoring', type: 'item' as const, classes: 'nav-item', url: '/monitoring', icon: 'user' },
          { id: 'analytics', title: 'Analytics', type: 'item' as const, classes: 'nav-item', url: '/analytics', icon: 'line-chart' },
          { id: 'devices', title: 'Devices', type: 'item' as const, classes: 'nav-item', url: '/devices', icon: 'rocket' },
          ...(isAdmin
            ? [{
              id: 'users',
              title: 'Users',
              type: 'item' as const,
              classes: 'nav-item',
              url: '/users',
              icon: 'user'
            }]
            : []),
        ]
      }
    ];

    return menu;
  }
}
