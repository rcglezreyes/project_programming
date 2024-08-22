import { ICountry } from './icountry.interface';
export interface ICustomer {
  pk: number;
  fields: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postal_code: string;
    country: number;
  };
}

export interface ICustomerFull {
  pk: number;
  fields: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postal_code: string;
    country: ICountry;
  };
}
