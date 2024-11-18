import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-notification-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  template: `
    <button mat-icon-button 
            [matMenuTriggerFor]="menu" 
            [matBadge]="unreadCount" 
            [matBadgeHidden]="unreadCount === 0"
            matBadgeColor="warn"
            (click)="loadNotifications()"
            class="notification-button dark:text-gray-300">
      <mat-icon >notifications</mat-icon>
    </button>
    <mat-menu #menu="matMenu" class="notification-menu">
      <div class="notification-header dark:bg-gray-800 dark:border-gray-700">
        <h3 class="px-4 py-2 text-lg font-semibold dark:text-white">Notifications</h3>
        <div class="flex gap-2">
          <button mat-button *ngIf="unreadCount > 0" 
                  (click)="markAllAsRead(); $event.stopPropagation()"
                  class="text-blue-600 dark:text-blue-400">
            Mark all as read
          </button>
        </div>
      </div>
      
      <div class="notification-list max-h-[400px] overflow-y-auto dark:bg-gray-800" (scroll)="onScroll($event)">
        <div *ngIf="notifications.length === 0" class="p-4 text-gray-500 dark:text-gray-400 text-center">
          No notifications
        </div>
        
        <div *ngFor="let notification of notifications" 
             class="notification-item p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700"
             [class.unread]="!notification.read"
             (click)="onNotificationClick(notification)">
          <div class="flex items-start gap-3">
            <div [class]="getNotificationIconClass(notification.type)">
              <mat-icon>{{getNotificationIcon(notification.type)}}</mat-icon>
            </div>
            
            <div class="flex-grow">
              <div class="flex justify-between items-start mb-1">
                <span class="font-medium text-gray-900 dark:text-white">{{notification.title}}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{getTimeAgo(notification.createdAt)}}
                </span>
              </div>
              
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span [class.px-2.py-1.rounded-md]="notification.type === 'task_modified'"
                      [class]="getStatusClass(notification.message)">
                  {{notification.message}}
                </span>
              </p>
              
              <div class="flex flex-wrap gap-2 mt-2">
                <span *ngIf="notification.projectId" 
                      class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <mat-icon class="text-sm mr-1">folder</mat-icon>
                  Project
                </span>
                <span *ngIf="notification.taskId" 
                      class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  <mat-icon class="text-sm mr-1">task</mat-icon>
                  Task
                </span>
              </div>
            </div>
            
            <div *ngIf="!notification.read" 
                 class="w-2 h-2 rounded-full bg-blue-500 mt-2">
            </div>
          </div>
        </div>
        
        <div *ngIf="loading" class="p-4 text-center dark:text-gray-300">
          <mat-spinner diameter="20"></mat-spinner>
        </div>
      </div>
    </mat-menu>
  `,
  styles: [`
    .notification-menu {
      max-width: 400px;
      min-width: 350px;
    }
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
      padding: 8px 16px;
      background-color: #f9fafb;
    }
    
    .notification-item {
      transition: background-color 0.2s;
    }
    
    .notification-item.unread {
      background-color: #f0f9ff;
    }
    
    :host-context(.dark) .notification-item.unread {
      background-color: rgba(59, 130, 246, 0.1);
    }
    
    .icon-container {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .icon-task {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    
    :host-context(.dark) .icon-task {
      background-color: rgba(14, 165, 233, 0.2);
      color: #38bdf8;
    }
    
    .icon-update {
      background-color: #f0fdf4;
      color: #15803d;
    }
    
    :host-context(.dark) .icon-update {
      background-color: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }
    
    .icon-mention {
      background-color: #fef3c7;
      color: #b45309;
    }
    
    :host-context(.dark) .icon-mention {
      background-color: rgba(234, 179, 8, 0.2);
      color: #facc15;
    }
    
    .icon-due {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    :host-context(.dark) .icon-due {
      background-color: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }
    
    .icon-edit {
      background-color: #f3e8ff;
      color: #7e22ce;
    }
    
    :host-context(.dark) .icon-edit {
      background-color: rgba(168, 85, 247, 0.2);
      color: #c084fc;
    }
    
    .icon-comment {
      background-color: #fae8ff;
      color: #c026d3;
    }
    
    :host-context(.dark) .icon-comment {
      background-color: rgba(216, 80, 240, 0.2);
      color: #e879f9;
    }
    
    .status-not-started {
      background-color: #f3f4f6;
      color: #4b5563;
    }
    
    :host-context(.dark) .status-not-started {
      background-color: rgba(75, 85, 99, 0.2);
      color: #9ca3af;
    }
    
    .status-in-progress {
      background-color: #dbeafe;
      color: #2563eb;
    }
    
    :host-context(.dark) .status-in-progress {
      background-color: rgba(37, 99, 235, 0.2);
      color: #60a5fa;
    }
    
    .status-done {
      background-color: #dcfce7;
      color: #16a34a;
    }
    
    :host-context(.dark) .status-done {
      background-color: rgba(22, 163, 74, 0.2);
      color: #4ade80;
    }
    
    .status-stuck {
      background-color: #fee2e2;
      color: #dc2626;
    }
    
    :host-context(.dark) .status-stuck {
      background-color: rgba(220, 38, 38, 0.2);
      color: #f87171;
    }
  `]
})
export class NotificationMenuComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscription: Subscription;
  currentPage = 1;
  loading = false;
  hasMore = true;
  isFirstLoad = true;

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
    // Don't load notifications immediately
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadNotifications(loadMore = false) {
    if (this.loading || (!loadMore && !this.isFirstLoad)) return;
    
    this.loading = true;
    const page = loadMore ? this.currentPage + 1 : 1;

    this.notificationService.getNotifications(page).subscribe({
      next: (response) => {
        if (loadMore) {
          this.notifications = [...this.notifications, ...response.notifications];
          this.currentPage++;
        } else {
          this.notifications = response.notifications;
          this.currentPage = 1;
          this.isFirstLoad = false;
        }
        this.hasMore = response.hasMore;
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
      }
    });
  }

  onScroll(event: any) {
    const element = event.target;
    if (
      this.hasMore &&
      !this.loading &&
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50
    ) {
      this.loadNotifications(true);
    }
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