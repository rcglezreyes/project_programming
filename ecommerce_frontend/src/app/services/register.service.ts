import { Injectable } from '@angular/core';
import { WebRequestService } from '../web-services/web-request.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class RegisterService {
    constructor(private webService: WebRequestService) { }


    getListCountries(): Observable<any> {
        return this.webService.fetchWithoutToken('list_countries').pipe(
            map(response => {
                return response;
            })
        );
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


    checkExistingUsername(username: string): Observable<any> {
        return this.webService.fetchWithoutToken('users/list_users', 'GET', { username: username }).pipe(
            map(response => {
                return response;
            })
        );
    }

    checkExistingEmailInUsers(email: string): Observable<any> {
        return this.webService.fetchWithoutToken('users/list_users', 'GET', { email: email }).pipe(
            map(response => {
                return response;
            })
        );
    }

    checkExistingEmailInCustomers(email: string): Observable<any> {
        return this.webService.fetchWithoutToken('customers/list_customers', 'GET', { email: email }).pipe(
            map(response => {
                return response;
            })
        );
    }

}
