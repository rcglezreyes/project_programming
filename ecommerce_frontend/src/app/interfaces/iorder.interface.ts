import { ICustomer } from './icustomer.interface';
import { IProduct } from './iproduct.interface';

export interface IOrder {
    pk: number;
    fields: {
        id: number;
        customer: number;
        total: number;
        created_at: string;
        updated_at: string;
        is_active: boolean;
    };
    selected?: boolean;
}

export interface IOrderItem {
    pk: number;
    fields: {
        id: number;
        order: number;
        product: number;
        quantity: number;
        size: string;
        is_active: boolean;
    };
}

export interface IOrderItemFull {
    pk: number;
    fields: {
        id: number;
        order: IOrder;
        product: IProduct;
        quantity: number;
        size: string;
        is_active: boolean;
    };
}