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

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response: AuthResponse) => {
          console.log('Login response:', response);
          localStorage.setItem('token', response.token);

          localStorage.setItem('username', response.username);
        }),
        catchError(this.handleError)
      );
  }

  loginWithGoogle(token: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/google`, { token })
      .pipe(
        tap((response: AuthResponse) => {
          localStorage.setItem('token', response.token);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
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
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }

  getUsername(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);

        if (
          decodedToken.username ||
          decodedToken.sub ||
          (decodedToken.user && decodedToken.user.username)
        ) {
          return (
            decodedToken.username ||
            decodedToken.sub ||
            decodedToken.user.username
          );
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    const localUsername = localStorage.getItem('username');
    if (localUsername) {
      return localUsername;
    }
    console.log('Username not found in token or localStorage');
    return null;
  }
}
