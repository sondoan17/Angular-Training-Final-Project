import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/api/projects`;

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getProjectDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createProject(projectData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, projectData);
  }

  updateProject(id: string, projectData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, projectData);
  }

  addMemberToProject(projectId: string, username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${projectId}/members`, { username });
  }
}
