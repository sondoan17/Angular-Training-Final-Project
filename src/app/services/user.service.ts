import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users'; // Adjust this URL as needed

  constructor(private http: HttpClient) {}

  checkUserExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${username}`);
  }

  getUserById(userId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/${userId}`, { headers });
  }
}
