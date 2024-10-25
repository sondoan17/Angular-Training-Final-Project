import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  token: string;
  userId: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  register(
    username: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        username,
        email,
        password,
      })
      .pipe(catchError(this.handleError));
  }

  login(username: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('username', response.username);
          }
        })
      );
  }

  loginWithGoogle(token: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/google`, { token })
      .pipe(tap(this.handleSuccessfulAuth), catchError(this.handleError));
  }

  private handleSuccessfulAuth(response: AuthResponse): void {
    if (response && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', response.username);
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (
        error.error &&
        typeof error.error === 'object' &&
        'message' in error.error
      ) {
        errorMessage += `\nServer message: ${error.error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    return true;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return (
          decodedToken.username ||
          decodedToken.sub ||
          (decodedToken.user && decodedToken.user.username) ||
          null
        );
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    return localStorage.getItem('username');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUserId(): string | null {
    const user = this.getUser();
    return user ? user.id : null;
  }

  getCurrentUsername(): string {
    return localStorage.getItem('username') || '';
  }

  private getUser(): any {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.userId, username: payload.username };
    }
    return null;
  }
}
