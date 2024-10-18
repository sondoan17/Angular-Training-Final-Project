import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Project {
  _id: string;
  id?: string;
  name: string;
  description: string;
  createdBy: string | { _id: string; username: string };
  members?: string[] | { _id: string; username: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/api/projects`;

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getUserProjects(): Observable<Project[]> {
    console.log('Fetching user projects');
    return this.http.get<Project[]>(`${this.apiUrl}`);
  }

  getProjectDetails(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`).pipe(
      map(project => {
        console.log('Received project details:', project);
        if (Array.isArray(project.members)) {
          project.members = project.members.map((member: any) => {
            if (typeof member === 'object' && member !== null && member.username) {
              return { _id: member._id, username: member.username };
            } else if (typeof member === 'string') {
              console.warn(`Member data not populated for ID: ${member}`);
              return { _id: member, username: 'Unknown' };
            }
            return { _id: 'unknown', username: 'Unknown' };
          });
        } else {
          console.error('Project members is not an array:', project.members);
          project.members = [];
        }
        console.log('Processed project members in service:', project.members);
        return project;
      })
    );
  }

  createProject(projectData: Omit<Project, 'id'>): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/create`, projectData);
  }

  updateProject(id: string, projectData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, projectData).pipe(
      map(project => {
        // Ensure members is an array of objects with username property
        project.members = project.members.map((member: any) => {
          if (typeof member === 'string') {
            return { _id: member, username: 'Unknown' };
          }
          return member;
        });
        return project;
      })
    );
  }

  addMemberToProject(projectId: string, username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${projectId}/members`, { username }).pipe(
      map(project => {
        console.log('Received project after adding member:', project);
        // Ensure members is an array of objects with username property
        project.members = project.members.map((member: any) => {
          if (typeof member === 'object' && member !== null) {
            return { _id: member._id, username: member.username || 'Unknown' };
          } else if (typeof member === 'string') {
            return { _id: member, username: 'Unknown' };
          }
          return { _id: 'unknown', username: 'Unknown' };
        });
        console.log('Processed project members in service:', project.members);
        return project;
      })
    );
  }

  removeMemberFromProject(projectId: string, memberId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}/members/${memberId}`);
  }
}
