import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users'; // Adjust this URL to match your server

  constructor(private http: HttpClient) {}

  checkUserExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${username}`);
  }
}
