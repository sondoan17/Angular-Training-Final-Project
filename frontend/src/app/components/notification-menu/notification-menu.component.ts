import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './notification-menu.component.html',
  styleUrls: ['./notification-menu.component.css']
})
export class NotificationMenuComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscription: Subscription;

  constructor(private notificationService: NotificationService) {
    this.subscription = this.notificationService.notifications$
      .subscribe(notification => {
        this.notifications.unshift(notification);
        if (!notification.read) {
          this.unreadCount++;
        }
      });
  }

  ngOnInit() {
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
      this.unreadCount = notifications.filter(n => !n.read).length;
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.read = true);
      this.unreadCount = 0;
    });
  }

  onNotificationClick(notification: Notification) {
    if (!notification.read && notification._id) {
      this.notificationService.markAsRead(notification._id).subscribe(() => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }

    // Navigate based on notification type
    if (notification.projectId) {
      if (notification.taskId) {
        // Navigate to task
        window.location.href = `/projects/${notification.projectId}/tasks/${notification.taskId}`;
      } else {
        // Navigate to project
        window.location.href = `/projects/${notification.projectId}`;
      }
    }
  }

  getNotificationIconClass(type: string): string {
    const baseClasses = 'icon-container ';
    switch (type) {
      case 'task_assignment':
        return baseClasses + 'icon-task';
      case 'project_update':
        return baseClasses + 'icon-update';
      case 'mention':
        return baseClasses + 'icon-mention';
      case 'due_date':
        return baseClasses + 'icon-due';
      case 'task_modified':
        return baseClasses + 'icon-edit';
      case 'new_comment':
        return baseClasses + 'icon-comment';
      default:
        return baseClasses + 'icon-update';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return notificationDate.toLocaleDateString();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'task_assignment':
        return 'assignment';
      case 'due_date':
        return 'event';
      case 'mention':
        return 'comment';
      case 'project_update':
        return 'update';
      case 'task_modified':
        return 'edit';
      case 'new_comment':
        return 'chat';
      default:
        return 'notifications';
    }
  }

  getStatusClass(message: string): string {
    if (message.includes('completed')) {
      return 'status-done';
    } else if (message.includes('started working on')) {
      return 'status-in-progress';
    } else if (message.includes('marked as stuck')) {
      return 'status-stuck';
    } else if (message.includes('reset')) {
      return 'status-not-started';
    }
    return '';
  }
} 