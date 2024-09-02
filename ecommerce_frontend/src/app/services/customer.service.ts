import { Injectable } from '@angular/core';
import { WebRequestService } from '../web-services/web-request.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../interfaces/iapiResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customersSubject = new BehaviorSubject<any[]>([]);
  customers$ = this.customersSubject.asObservable();

  constructor(private webService: WebRequestService) {
    this.loadListCustomers(); 
  }

  loadListCustomers(): void {
    this.webService.fetchWithToken<IApiResponse<any[]>>('customers/list_customers').subscribe({
      next: (response: any) => {  
        const customers = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        this.customersSubject.next(customers);
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

  getListCustomers(): Observable<any[]> {
    return this.customers$; 
  }

  manageCustomer(payload: Object, isRegistration: boolean, isProfileEdit: boolean): Observable<any> {
    if (isRegistration) {
      payload = { ...payload, is_registration: true };
      return this.webService.fetchWithoutToken('customers/manage_customer', 'POST', payload);
    }
    else if (isProfileEdit) {
      payload = { ...payload, is_profile_edit: true };
    }
    return this.webService.fetchWithToken('customers/manage_customer', 'POST', payload);
  }

  deleteCustomer(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('customers/delete_customer', 'POST', payload).pipe(
      map((response) => {
        this.loadListCustomers();
        return response;
      })
    );
  }
}
