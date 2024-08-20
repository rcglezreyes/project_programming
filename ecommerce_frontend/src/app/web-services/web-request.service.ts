import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebRequestService {
  readonly ROOT_URL;
  readonly headers = new HttpHeaders().set('Content-Type', 'application/json');
  resp: any;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.ROOT_URL = `${environment.serviceHost}`;
    this.headers.append('Accept', 'application/json');
  }

  fetchWithToken<T>(uri: string, method: string = 'GET', payload: any = null): Observable<T> {
    const url = `${this.ROOT_URL}/${uri}/`;
    return this.makeRequest<T>(url, method, payload).pipe(
      catchError(error => {
        if (error.status === 401) {
          return this.authService.refreshToken(this.ROOT_URL).pipe(
            switchMap(newAccessToken => {
              if (newAccessToken) {
                return this.makeRequest<T>(url, method, payload, newAccessToken);
              } else {
                return throwError(() => 'Could not refresh token');
              }
            })
          );
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  fetchWithoutToken<T>(uri: string, method: string = 'GET', payload: any = null): Observable<T> {
    const url = `${this.ROOT_URL}/${uri}/`;
    return this.makeRequest<T>(url, method, payload);
  }

  private makeRequest<T>(url: string, method: string, payload: any = null, token: string | null = null): Observable<T> {
    const authHeaders = token ? this.headers.set('Authorization', `Bearer ${token}`) : this.headers;
    const options = { headers: authHeaders, withCredentials: true };

    switch (method) {
      case 'POST':
        return this.http.post<T>(url, payload, options);
      case 'PUT':
        return this.http.put<T>(url, payload, options);
      case 'DELETE':
        return this.http.delete<T>(url, options);
      default:
        return this.http.get<T>(url, { ...options, params: payload });
    }
  }
}
