import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  console.log('Interceptor called for URL:', req.url);
  const token = localStorage.getItem('token');
  console.log('Token in interceptor:', token ? 'Token exists' : 'No token');

  if (token) {
    console.log('Adding token to request');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('Modified request headers:', authReq.headers.keys());
    return next(authReq);
  }

  console.log('No token found, proceeding without authentication');
  return next(req);
};
