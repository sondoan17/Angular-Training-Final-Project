import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Notification {
  _id?: string;
  userId?: string;
  recipients?: string[];
  type: 'task_assignment' | 'task_modified' | 'due_date' | 'mention' | 'project_update' | 'new_comment';
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
  read: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;
  private notificationSubject = new Subject<Notification>();
  notifications$ = this.notificationSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user`);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`);
  }

  // Method to emit new notifications (will be used with WebSocket)
  emitNewNotification(notification: Notification) {
    this.notificationSubject.next(notification);
  }

  // Add method to create notifications for multiple users
  createNotificationForMembers(notification: Omit<Notification, '_id'>, members: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, { ...notification, recipients: members });
  }
} 