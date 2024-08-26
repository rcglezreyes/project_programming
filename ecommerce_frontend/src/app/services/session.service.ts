import { Injectable } from '@angular/core';
import { WebRequestService } from '../web-services/web-request.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class SessionService {
    constructor(private webService: WebRequestService) { }

    getSessionData(): Observable<any> {
        const payload = {
            username: localStorage.getItem('username')
        };
        return this.webService.fetchWithToken('get_session_data', 'GET', payload).pipe(
            map((response: any) => {
                localStorage.setItem('isStaff', response.is_staff);
                localStorage.setItem('username', response.username);
                localStorage.setItem('firstName', response.first_name);
                localStorage.setItem('lastName', response.last_name);
                localStorage.setItem('email', response.email);
                localStorage.setItem('numberOfLogins', response.number_of_logins);
                localStorage.setItem('customerId', response.customer?.id);
                localStorage.setItem(
                    'customerLogged', response.customer ? JSON.stringify(response.customer) : ''
                );
                return response;
            })
        );
    }

}
