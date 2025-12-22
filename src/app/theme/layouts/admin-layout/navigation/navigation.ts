export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}


//  role helpers
const getRole = () => (localStorage.getItem('role') || '').toLowerCase();
const isAdmin = () => getRole() === 'admin';
const isUser = () => getRole() === 'user';

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      //  Admin only
      {
        id: 'admin-dashboard',
        title: 'Admin Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/admin-dashboard',
        icon: 'dashboard',
        breadcrumbs: false,
        hidden: !isAdmin()
      },

      // User only
      {
        id: 'user-dashboard',
        title: 'My Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/user-dashboard',
        icon: 'dashboard',
        breadcrumbs: false,
        hidden: !isUser()
      }
    ]
  },

  {
    id: 'authentication',
    title: 'Authentication',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'login',
        title: 'Login',
        type: 'item',
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
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'monitoring',
        title: 'Monitoring',
        type: 'item',
        classes: 'nav-item',
        url: '/monitoring',
        icon: 'user'
      },
      {
        id: 'users',
        title: 'Users',
        type: 'item',
        classes: 'nav-item',
        url: '/users',
        icon: 'user',
        hidden: !isAdmin()   // ADMIN ONLY
      },

      {
        id: 'analytics',
        title: 'Analytics',
        type: 'item',
        classes: 'nav-item',
        url: '/analytics',
        icon: 'line-chart'
      },
      {
        id: 'devices',
        title: 'Devices',
        type: 'item',
        classes: 'nav-item',
        url: '/device-management',
        icon: 'rocket'
      },
       {
        id: 'devices',
        title: 'Devices',
        type: 'item',
        classes: 'nav-item',
        url: '/my-devices',
        icon: 'rocket'
      },
      {
        id: 'ant-icons',
        title: 'Ant Icons',
        type: 'item',
        classes: 'nav-item',
        url: 'https://ant.design/components/icon',
        icon: 'ant-design',
        target: true,
        external: true
      }
    ]
  },

  {
    id: 'other',
    title: 'Other',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'sample-page',
        title: 'Sample Page',
        type: 'item',
        url: '/sample-page',
        classes: 'nav-item',
        icon: 'chrome'
      },
      {
        id: 'document',
        title: 'Document',
        type: 'item',
        classes: 'nav-item',
        url: 'https://codedthemes.gitbook.io/mantis-angular/',
        icon: 'question',
        target: true,
        external: true
      }
    ]
  }
];
