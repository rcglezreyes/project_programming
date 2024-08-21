import { ICategory } from './icategory.interface';
export interface IProduct {
    pk: number;
    fields: {
        id: number;
        name: string;
        description: string;
        price: number;
        stock: number;
        available: boolean;
        created_at: string;
        updated_at: string;
        category: ICategory;
        image: string;
        is_active: boolean;
    };
}