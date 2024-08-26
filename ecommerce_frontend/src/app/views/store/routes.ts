import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Store'
    },
    children: [
      {
        path: '',
        redirectTo: 'customers',
        pathMatch: 'full'
      },
      {
        path: 'customers',
        loadComponent: () => import('./customer/list-customers/list-customers.component').then(m => m.ListCustomersComponent),
        data: {
          title: 'Customers'
        }
      },
      {
        path: 'manage_customer',
        loadComponent: () => import('./customer/manage-customer/manage-customer.component').then(m => m.ManageCustomerComponent),
        data: {
          title: 'Manage Customers'
        }
      },
      {
        path: 'products',
        loadComponent: () => import('./product/list-products/list-products.component').then(m => m.ListProductsComponent),
        data: {
          title: 'Products'
        }
      },
      {
        path: 'manage_product',
        loadComponent: () => import('./product/manage-product/manage-product.component').then(m => m.ManageProductComponent),
        data: {
          title: 'Manage Product'
        }
      },
      {
        path: 'carts',
        loadComponent: () => import('./cart/list-carts/list-carts.component').then(m => m.ListCartsComponent),
        data: {
          title: 'Products'
        }
      },
      {
        path: 'orders',
        loadComponent: () => import('./order/list-orders/list-orders.component').then(m => m.ListOrdersComponent),
        data: {
          title: 'Orders'
        }
      },
    ]
  }
];


