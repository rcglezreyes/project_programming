import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, switchMap} from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../environments/environment.development';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { IUser } from './interfaces/iuser.interface';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  readonly apiUrl;
  readonly headers = new HttpHeaders().set('Content-Type', 'application/json');
  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';
  // private userSubject = new BehaviorSubject<IUser | null>(null);
  // public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.apiUrl = `${environment.serviceHost}`;
    this.headers.append('Accept', 'application/json');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  logout() {
    const data = {
      username: localStorage.getItem('username') || ''
    };

    this.http.get(`${this.apiUrl}/logout/`, { params: data }).subscribe({
      next: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isStaff');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        localStorage.removeItem('customerId');
        this.router.navigate(['/login']); 
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }

  login(username: string, password: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/api/token/`, { username, password }, { headers })
      .pipe(
        catchError(error => {
          return of(null);
        })
      );
  }

  authenticate(username: string, password: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': this.getCookie('csrftoken')
    });

    return this.http.post(`${this.apiUrl}/login/`, { username, password }, { headers })
      .pipe(
        catchError(error => {
          return of(null); // Manejar el error aquí
        })
      );
  }

  private getCookie(name: string): string {
    const ca: Array<string> = document.cookie.split(';');
    const caLen: number = ca.length;
    const cookieName = `${name}=`;
    let c: string;

    for (let i = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) === 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  refreshToken(apiUrl: string): Observable<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available')); 
    }

    return this.http.post<{ access: string }>(`${apiUrl}/api/token/refresh/`, { refresh: refreshToken }).pipe(
      map(response => response.access),
      switchMap(accessToken => {
        this.setTokens(accessToken, refreshToken);
        return new Observable<string>(observer => observer.next(accessToken));
      }),
      catchError(error => {
        console.error('Error refreshing token:', error);
        return throwError(() => error); 
      })
    );
  }

}
