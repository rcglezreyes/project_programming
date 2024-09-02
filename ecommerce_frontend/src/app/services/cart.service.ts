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
    if (localStorage.getItem('isStaff') !== 'admin') {
      const payload = {
        customer_id: localStorage.getItem('customerId')
      };
      this.webService.fetchWithToken<IApiResponse<any[]>>('carts/list_carts', 'GET', payload).subscribe({
        next: (response: any) => {
          const carts = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          this.cartsSubject.next(carts);
          localStorage.setItem('numberCartItems', carts.length.toString());
        },
        error: (error) => {
          console.error('Request failed:', error);
        }
      });
    }
  }

  getListCarts(): Observable<any[]> {
    return this.carts$;
  }

  manageCart(payload: any): Observable<any> {
    return this.webService.fetchWithToken('carts/manage_cart', 'POST', payload).pipe(
      tap(response => {
        if (response) {
          const currentCarts = this.cartsSubject.value;

          const cartIndex = currentCarts.findIndex(cart => cart.pk === payload.id);

          if (cartIndex !== -1) {
            currentCarts[cartIndex] = {
              ...currentCarts[cartIndex],
              ...payload
            };
          } else {
            currentCarts.push(payload);
          }
          this.cartsSubject.next([...currentCarts]);
          localStorage.setItem('numberCartItems', currentCarts.length.toString());
        }
      })
    )
  }

  deleteCart(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('carts/delete_cart', 'POST', payload).pipe(
      map((response) => {
        this.loadListCarts();
        return response;
      })
    );
  }
}
