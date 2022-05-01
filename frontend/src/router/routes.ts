import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'tables', component: () => import('src/pages/AuthenticatedPages/TablesPage.vue') },
      { path: 'bookings', name: 'bookings', component: () => import('src/pages/AuthenticatedPages/BookingsPage.vue') },
      { path: 'login', name: 'login', component: () => import('src/pages/UnAuthenticatedPages/LoginPage.vue') },
      { path: 'register', name: 'register', component: () => import('src/pages/UnAuthenticatedPages/RegisterPage.vue') },
      { path: 'password-reset', name: 'password-reset', component: () => import('src/pages/UnAuthenticatedPages/PasswordReset.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
