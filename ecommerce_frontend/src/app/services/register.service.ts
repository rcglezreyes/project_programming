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

    manageCustomer(payload: Object, isRegistration: boolean): Observable<any> {
        if (isRegistration) {
            payload = { ...payload, is_registration: true };
            return this.webService.fetchWithoutToken('manage_customer', 'POST', payload);
        }
        return this.webService.fetchWithToken('manage_customer', 'POST', payload);
    }


    checkExistingUsername(username: string): Observable<any> {
        return this.webService.fetchWithoutToken('list_users', 'GET', { username: username }).pipe(
            map(response => {
                return response;
            })
        );
    }

    checkExistingEmailInUsers(email: string): Observable<any> {
        return this.webService.fetchWithoutToken('list_users', 'GET', { email: email }).pipe(
            map(response => {
                return response;
            })
        );
    }

    checkExistingEmailInCustomers(email: string): Observable<any> {
        return this.webService.fetchWithoutToken('list_customers', 'GET', { email: email }).pipe(
            map(response => {
                return response;
            })
        );
    }


    //   createNewUser(payload: Object) {
    //     return this.webService.post('create_user', payload);
    //   }

    //   updateUser(payload: Object, user_id: number) {
    //     return this.webService.put('update_user', payload, user_id);
    //   }

    //   deleteUser(user_id: number) {
    //     return this.webService.delete('delete_user', user_id);
    //   }

}
