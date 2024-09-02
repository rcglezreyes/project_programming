import { Injectable } from '@angular/core';
import { WebRequestService } from '../web-services/web-request.service';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
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
    this.webService.fetchWithToken<IApiResponse<any[]>>('products/list_products').subscribe({
      next: (response: any) => {  
        const products = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        this.productsSubject.next(products);
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

  loadListCategories(): Observable<any> {
    return this.webService.fetchWithToken('products/list_categories');
}   

  getListProducts(): Observable<any[]> {
    return this.products$; 
  }

  manageProduct(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('products/manage_product', 'POST', payload);
  }

  deleteProduct(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('products/delete_product', 'POST', payload).pipe(
      map((response) => {
        this.loadListProducts(); 
        return response;
      })
    );
  }

  uploadImage(formData: FormData): Observable<string> {
    return this.webService.fetchWithToken<{ imageUrl: string }>('products/upload_image', 'UPLOAD', formData).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          return event.body?.imageUrl ?? ''; 
        }
        return '';
      }),
      catchError(error => {
        console.error('Error uploading file:', error);
        return throwError(() => new Error('File upload failed'));
      })
    );
  }
}
