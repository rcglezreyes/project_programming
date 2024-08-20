import { INavData } from '@coreui/angular';

console.log(localStorage.getItem('isStaff'));

interface INavDataExtended extends INavData {
  isVisible?: boolean | (() => boolean);
}

const options = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    },
    isVisible: true 
  },
  {
    title: true,
    name: 'Store',
    isVisible: true 
  },
  {
    name: 'Manage Customers',
    url: '/store/customers',
    iconComponent: { name: 'cil-people' },
    isVisible: () => localStorage.getItem('isStaff') === 'admin'
  },
  {
    name: 'My Cart',
    url: '/store/products',
    iconComponent: { name: 'cil-basket' },
    badge: {
      color: 'danger',
      text: '3'
    },
    isVisible: () => localStorage.getItem('isStaff') === 'user'
  },
  {
    name: 'Products',
    url: '/store/my_products',
    iconComponent: { name: 'cil-layers' },
    isVisible: () => localStorage.getItem('isStaff') === 'user'
  },
  {
    name: 'Manage Products',
    url: '/store/products',
    iconComponent: { name: 'cil-layers' },
    isVisible: () => localStorage.getItem('isStaff') === 'admin' 
  },
  {
    name: 'Orders',
    url: '/store/orders',
    iconComponent: { name: 'cil-notes' },
    isVisible: () => localStorage.getItem('isStaff') === 'user'
  },
  {
    name: 'Manage Orders',
    url: '/store/manage_orders',
    iconComponent: { name: 'cil-notes' },
    isVisible: () => localStorage.getItem('isStaff') === 'admin' 
  },
  {
    name: 'Administration',
    title: true,
    isVisible: () => localStorage.getItem('isStaff') === 'admin' 
  },
  {
    name: 'Users',
    url: '/store/users',
    iconComponent: { name: 'cil-people' },
    isVisible: () => localStorage.getItem('isStaff') === 'admin' 
  }
]

export const navItems: INavDataExtended[] = options.filter(option => {
  if (typeof option.isVisible === 'function') {
    return option.isVisible();
  }
  return option.isVisible !== false;
});
        
