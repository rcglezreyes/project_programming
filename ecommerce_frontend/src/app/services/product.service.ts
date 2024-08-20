import { Injectable } from '@angular/core';
import { WebRequestService } from '../web-services/web-request.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../interfaces/iapiResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<any[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private webService: WebRequestService) {
    this.loadListProducts(); 
  }

  loadListProducts(): void {
    this.webService.fetchWithToken<IApiResponse<any[]>>('list_products').subscribe({
      next: (response: IApiResponse<any[]>) => {  
        const products = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        this.productsSubject.next(products);
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

  loadListCategories(): Observable<any> {
    return this.webService.fetchWithToken('list_categories');
}   

  getListProducts(): Observable<any[]> {
    return this.products$; 
  }

  manageProduct(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('manage_product', 'POST', payload);
  }

  deleteProduct(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('delete_product', 'POST', payload).pipe(
      map((response) => {
        this.loadListProducts(); // Recargar la lista después de eliminar
        return response;
      })
    );
  }
}
