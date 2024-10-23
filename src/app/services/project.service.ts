import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Project {
  _id: string;
  name: string;
  description: string;
  members?: { _id: string; name: string }[];
  createdAt: Date;
  createdBy?: { _id: string; name: string };
  // ... other properties
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  timeline: Date;
  assignedTo: string[] | { _id: string; username: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/api/projects`;

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getUserProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}`);
  }

  getProjectDetails(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}`);
  }

  createProject(projectData: Omit<Project, 'id'>): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/create`, projectData);
  }

  updateProject(id: string, projectData: any): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, projectData).pipe(
      map((project) => {
        if (Array.isArray(project.members)) {
          project.members = project.members.map((member: any) => {
            if (typeof member === 'string') {
              return { _id: member, username: 'Unknown' };
            }
            return member;
          });
        }
        return project;
      })
    );
  }

  addMemberToProject(projectId: string, username: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${projectId}/members`, { username })
      .pipe(
        map((project) => {
          project.members = project.members.map((member: any) => {
            if (typeof member === 'object' && member !== null) {
              return {
                _id: member._id,
                username: member.username || 'Unknown',
              };
            } else if (typeof member === 'string') {
              return { _id: member, username: 'Unknown' };
            }
            return { _id: 'unknown', username: 'Unknown' };
          });
          return project;
        })
      );
  }

  removeMemberFromProject(
    projectId: string,
    memberId: string
  ): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}/members/${memberId}`);
  }

  createTask(projectId: string, taskData: Omit<Task, '_id'>): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${projectId}/tasks`, taskData);
  }

  updateTaskStatus(
    projectId: string,
    taskId: string,
    status: string
  ): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(
      `${this.apiUrl}/${projectId}/tasks/${taskId}`,
      { status },
      { headers }
    );
  }

  getTaskDetails(projectId: string, taskId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}/tasks/${taskId}`);
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}`);
  }

  getAssignedTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assigned-tasks`);
  }

  searchProjectsAndTasks(searchTerm: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?term=${searchTerm}`);
  }

  deleteTask(projectId: string, taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}/tasks/${taskId}`);
  }

  updateTask(projectId: string, taskId: string, taskData: any): Observable<any> {
    // Ensure we're sending only IDs for assignedTo
    const updatedTaskData = {
      ...taskData,
      assignedTo: taskData.assignedTo.map((member: any) => 
        typeof member === 'object' ? member._id : member
      )
    };
    return this.http.put<any>(`${this.apiUrl}/${projectId}/tasks/${taskId}`, updatedTaskData).pipe(
      map(task => ({
        ...task,
        assignedTo: task.assignedTo.map((member: any) => ({
          _id: member._id,
          username: member.username || 'Unknown'
        }))
      }))
    );
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
}
