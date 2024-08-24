import { Injectable } from '@angular/core';
import { WebRequestService } from '../web-services/web-request.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { interval } from 'rxjs';
import { IApiResponse } from '../interfaces/iapiResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<any[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(private webService: WebRequestService) {
    this.loadListOrders();
  }

  loadListOrders(): void {
    const payload = {
      customer_id: localStorage.getItem('customerId')
    };
    this.webService.fetchWithToken<IApiResponse<any[]>>('list_orders', 'GET', payload).subscribe({
      next: (response: any) => {
        const orders = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        this.ordersSubject.next(orders);
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

  getListOrders(): Observable<any[]> {
    return this.orders$;
  }

  manageOrder(payload: any): Observable<any> {
    return this.webService.fetchWithToken('manage_order', 'POST', payload).pipe(
      tap(response => {
        if (response) {
          const currentOrders = this.ordersSubject.value;

          const orderIndex = currentOrders.findIndex(order => order.pk === payload.id);

          if (orderIndex !== -1) {
            currentOrders[orderIndex] = {
              ...currentOrders[orderIndex],
              ...payload
            };
          } else {
            currentOrders.push(payload);
          }
          this.ordersSubject.next([...currentOrders]);
        }
      })
    )
  }

  deleteOrder(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('delete_order', 'POST', payload).pipe(
      map((response) => {
        this.loadListOrders();
        return response;
      })
    );
  }
}
