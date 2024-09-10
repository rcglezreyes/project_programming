import { Injectable } from '@angular/core';
import { WebRequestService } from '../web-services/web-request.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../interfaces/iapiResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<any[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private webService: WebRequestService) {
    this.loadListUsers(); 
  }

  loadListUsers(): void {
    this.webService.fetchWithToken<IApiResponse<any[]>>('users/list_users').subscribe({
      next: (response: any) => {  
        const users = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        this.usersSubject.next(users);
      },
      error: (error) => {
        console.error('Request failed:', error);
      }
    });
  }

  getListUsers(): Observable<any[]> {
    return this.users$; 
  }

  manageUser(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('users/manage_user', 'POST', payload);
  }

  deleteUser(payload: Object): Observable<any> {
    return this.webService.fetchWithToken('users/delete_user', 'POST', payload).pipe(
      map((response) => {
        this.loadListUsers();
        return response;
      })
    );
  }
}
