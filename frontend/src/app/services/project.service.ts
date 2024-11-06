import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Project {
  _id: string;
  name: string;
  description: string;
  members: { _id: string; username: string }[];
  createdBy: { _id: string; username: string };
  createdAt: Date;
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

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getUserProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}`)
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
    return this.http.delete(`${this.apiUrl}/${projectId}/members/${memberId}`).pipe(
      tap(() => {
        // Refresh project data after member removal
        this.getProjectDetails(projectId).subscribe();  // Using getProjectDetails instead of getProjectById
      })
    );
  }

  createTask(projectId: string, taskData: Omit<Task, '_id'>): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${projectId}/tasks`, taskData);
  }

  updateTaskStatus(projectId: string, taskId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${projectId}/tasks/${taskId}`, { status })
      .pipe(
        map(response => {
          // console.log('Server response:', response);
          if (!response) {
            throw new Error('No response from server');
          }
          if (!response._id) {
            throw new Error('Invalid task data returned from server');
          }
          if (response.assignedTo && Array.isArray(response.assignedTo)) {
            response.assignedTo = response.assignedTo.map((member: any) => {
              if (typeof member === 'object' && member !== null) {
                return {
                  _id: member._id,
                  username: member.username || 'Unknown'
                };
              } else if (typeof member === 'string') {
                return { _id: member, username: 'Unknown' };
              }
              return { _id: 'unknown', username: 'Unknown' };
            });
          } else {
            response.assignedTo = [];
          }
          return response;
        }),
        catchError(error => {
          console.error('Error in updateTaskStatus:', error);
          return throwError(() => new Error('An error occurred while updating the task status.'));
        })
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

  getTaskActivityLog(projectId: string, taskId: string, page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}/tasks/${taskId}/activity?page=${page}`);
  }

  getProjectActivityLog(projectId: string, page: number = 1, pageSize: number = 5): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}/activity?page=${page}&pageSize=${pageSize}`);
  }

  getTaskComments(projectId: string, taskId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${projectId}/tasks/${taskId}/comments`);
  }

  addTaskComment(projectId: string, taskId: string, commentData: { content: string }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${projectId}/tasks/${taskId}/comments`,
      commentData
    );
  }

  updateTaskComment(
    projectId: string,
    taskId: string,
    commentId: string,
    data: { content: string }
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${projectId}/tasks/${taskId}/comments/${commentId}`,
      data
    );
  }

  deleteTaskComment(
    projectId: string,
    taskId: string,
    commentId: string
  ): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${projectId}/tasks/${taskId}/comments/${commentId}`
    );
  }

  getProjectMembers(projectId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/projects/${projectId}/members`);
  }
}
