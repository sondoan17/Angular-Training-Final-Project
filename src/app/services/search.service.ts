import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  searchProjectsAndTasks(
    searchTerm: string,
    status?: string,
    priority?: string,
    type?: string
  ): Observable<any> {
    let url = `${this.apiUrl}/search?term=${searchTerm}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    if (type) url += `&type=${type}`;
    return this.http.get(url);
  }
}
