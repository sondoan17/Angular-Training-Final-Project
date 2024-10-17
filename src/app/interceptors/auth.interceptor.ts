import { HttpInterceptorFn } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Interceptor called for URL:', req.url);
  const token = localStorage.getItem('token');
  console.log('Token in interceptor:', token ? 'Token exists' : 'No token');
  
  if (token) {
    console.log('Adding token to request');
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Modified request headers:', cloned.headers.keys());
    return next(cloned);
  } else {
    console.log('No token found, proceeding without authentication');
  }
  return next(req);
};

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    return next.handle(request);
  }
}
