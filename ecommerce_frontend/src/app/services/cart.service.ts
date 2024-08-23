import { Injectable } from '@angular/core';
import { WebRequestService } from '../web-services/web-request.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { interval } from 'rxjs';
import { IApiResponse } from '../interfaces/iapiResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartsSubject = new BehaviorSubject<any[]>([]);
  carts$ = this.cartsSubject.asObservable();

  constructor(private webService: WebRequestService) {
    this.loadListCarts(); 
  }

  loadListCarts(): void {
    const payload = {
      customer_id: localStorage.getItem('customerId')
    };
    this.webService.fetchWithToken<IApiResponse<any[]>>('list_carts', 'GET', payload).subscribe({
      next: (response: any) => {  
        const carts = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        this.cartsSubject.next(carts);
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

  getListCarts(): Observable<any[]> {
    return this.carts$; 
  }

  manageCart(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('manage_cart', 'POST', payload).pipe(
      tap(response => {
        if (response) {
          const currentCarts = this.cartsSubject.value;
          this.cartsSubject.next([...currentCarts, payload]);
        }
      })
    )
        
  }

  deleteCart(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('delete_cart', 'POST', payload).pipe(
      map((response) => {
        this.loadListCarts();
        return response;
      })
    );
  }
}
