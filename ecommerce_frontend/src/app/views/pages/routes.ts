import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '404',
    loadComponent: () => import('./page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'user/users',
    loadComponent: () => import('./user/list-users/list-users.component').then(m => m.ListUsersComponent),
    data: {
      title: 'Users List'
    }
  },
  {
    path: 'user/manage_user',
    loadComponent: () => import('./user/manage-user/manage-user.component').then(m => m.ManageUserComponent),
    data: {
      title: 'Manage User'
    }
  }
];
