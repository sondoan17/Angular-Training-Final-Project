import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { NotificationService, Notification } from './notification.service';

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

interface ProjectMember {
  _id: string;
  username: string;
}

interface TaskAssignee {
  _id: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/api/projects`;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

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
          project.members = project.members.map((member: string | ProjectMember) => {
            if (typeof member === 'string') {
              return { _id: member, username: 'Unknown' };
            }
            return member;
          });
        }

        const notification: Notification = {
          type: 'project_update',
          title: 'Project Updated',
          message: `Project "${project.name}" has been updated with new ${
            projectData.description ? 'description' : 'details'
          }`,
          projectId: id,
          read: false,
          createdAt: new Date()
        };
        
        const memberIds = project.members
          .map(member => member._id)
          .filter((id): id is string => typeof id === 'string');

        if (memberIds.length > 0) {
          this.notificationService.createNotificationForMembers(notification, memberIds).subscribe();
        }
        
        return project;
      })
    );
  }

  addMemberToProject(projectId: string, username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${projectId}/members`, { username })
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
          
          // Notify about new member
          const notification: Notification = {
            type: 'project_update',
            title: 'New Project Member',
            message: `${username} has been added to the project`,
            projectId,
            read: false,
            createdAt: new Date()
          };
          this.notificationService.emitNewNotification(notification);
          
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
    return this.http.post<Task>(`${this.apiUrl}/${projectId}/tasks`, taskData).pipe(
      tap(response => {
        // Get project details to get member list
        this.getProjectDetails(projectId).subscribe(project => {
          const memberIds = project.members.map((member: any) => member._id);
          
          const notification: Notification = {
            type: 'project_update',
            title: 'New Task Created',
            message: `A new task "${taskData.title}" has been created`,
            projectId,
            taskId: response._id,
            read: false,
            createdAt: new Date()
          };
          
          this.notificationService.createNotificationForMembers(notification, memberIds).subscribe();
        });
      })
    );
  }

  updateTaskStatus(projectId: string, taskId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${projectId}/tasks/${taskId}`, { status })
      .pipe(
        tap(response => {
          this.getProjectDetails(projectId).subscribe(project => {
            const currentUserId = localStorage.getItem('userId');
            const currentUsername = localStorage.getItem('username');

            const statusMessage = this.getStatusChangeMessage(status);
            const notification: Notification = {
              type: 'task_modified',
              title: 'Task Status Updated',
              message: `${currentUsername} ${statusMessage} task "${response.title}" in project "${project.name}"`,
              projectId,
              taskId,
              read: false,
              createdAt: new Date()
            };

            const assigneeIds = (response.assignedTo as (string | TaskAssignee)[])
              .map(member => typeof member === 'object' ? member._id : member)
              .filter((id): id is string => 
                typeof id === 'string' && id !== currentUserId
              );

            if (project.createdBy._id !== currentUserId) {
              assigneeIds.push(project.createdBy._id);
            }

            const uniqueRecipients = [...new Set(assigneeIds)];

            if (uniqueRecipients.length > 0) {
              this.notificationService.createNotificationForMembers(notification, uniqueRecipients).subscribe();
            }
          });
        })
      );
  }

  // Helper method to generate status change messages
  private getStatusChangeMessage(status: string): string {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'started working on';
      case 'done':
        return 'completed';
      case 'stuck':
        return 'marked as stuck';
      case 'not started':
        return 'reset the status of';
      default:
        return 'updated the status of';
    }
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
      })),
      tap(response => {
        // Get project details to notify the owner
        this.getProjectDetails(projectId).subscribe(project => {
          const currentUserId = localStorage.getItem('userId');
          const notification: Notification = {
            type: 'project_update',
            title: 'Task Modified',
            message: `${localStorage.getItem('username')} modified task "${response.title}" in your project "${project.name}"`,
            projectId,
            taskId,
            userId: project.createdBy._id, // Send to project owner
            read: false,
            createdAt: new Date()
          };

          // Only notify if the modifier is not the owner
          if (currentUserId !== project.createdBy._id) {
            this.notificationService.createNotificationForMembers(notification, [project.createdBy._id]).subscribe();
          }
        });
      })
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
    ).pipe(
      tap(response => {
        this.getProjectDetails(projectId).subscribe(project => {
          this.getTaskDetails(projectId, taskId).subscribe(task => {
            const currentUserId = localStorage.getItem('userId');
            const currentUsername = localStorage.getItem('username');
            
            const notification: Notification = {
              type: 'mention',
              title: 'New Comment',
              message: `${currentUsername} commented on task "${task.title}" in project "${project.name}": "${commentData.content.substring(0, 50)}${commentData.content.length > 50 ? '...' : ''}"`,
              projectId,
              taskId,
              userId: project.createdBy._id,
              read: false,
              createdAt: new Date()
            };

            const recipients: string[] = [];

            if (currentUserId !== project.createdBy._id) {
              recipients.push(project.createdBy._id);
            }

            const assigneeIds = (task.assignedTo as (string | TaskAssignee)[])
              .map(member => typeof member === 'object' ? member._id : member)
              .filter((id): id is string => 
                typeof id === 'string' && 
                id !== currentUserId && 
                id !== project.createdBy._id
              );

            recipients.push(...assigneeIds);

            const uniqueRecipients = [...new Set(recipients)];
            if (uniqueRecipients.length > 0) {
              this.notificationService.createNotificationForMembers(notification, uniqueRecipients).subscribe();
            }
          });
        });
      })
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

  assignTask(projectId: string, taskId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${projectId}/tasks/${taskId}/assign`, { userId })
      .pipe(
        tap(response => {
          this.getProjectDetails(projectId).subscribe(project => {
            const currentUserId = localStorage.getItem('userId');
            const currentUsername = localStorage.getItem('username');

            // Notification for the newly assigned user
            const assigneeNotification: Notification = {
              type: 'task_assignment',
              title: 'New Task Assignment',
              message: `You have been assigned to task "${response.task.title}" in project "${project.name}"`,
              projectId,
              taskId,
              read: false,
              createdAt: new Date()
            };

            // Notification for the project owner (if different from assigner)
            const ownerNotification: Notification = {
              type: 'task_modified',
              title: 'Task Assignment Updated',
              message: `${currentUsername} assigned task "${response.task.title}" to ${response.task.assignedTo.map((u: any) => u.username).join(', ')}`,
              projectId,
              taskId,
              read: false,
              createdAt: new Date()
            };

            // Send notification to newly assigned user
            this.notificationService.createNotificationForMembers(assigneeNotification, [userId]).subscribe();

            // Send notification to project owner if they're not the one assigning
            if (project.createdBy._id !== currentUserId) {
              this.notificationService.createNotificationForMembers(ownerNotification, [project.createdBy._id]).subscribe();
            }
          });
        })
      );
  }
}
