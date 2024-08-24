import { ICustomerFull } from "./icustomer.interface";
import { IProduct } from "./iproduct.interface";

export interface ICart {
    pk: number;
    fields: {
        id: number;
        customer: number;
        product: number;
        quantity: number;
        size: string;
    };
}

export interface ICartFull {
    pk: number;
    fields: {
        id: number;
        quantity: number;
        created_at: string;
        updated_at: string;
        is_active: boolean;
        customer: ICustomerFull
        product: IProduct;
        size: string;
        
    };
    selected?: boolean;
}
