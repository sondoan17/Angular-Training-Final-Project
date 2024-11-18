import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from './edit-task-dialog/edit-task-dialog.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../services/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css'],
  providers: [DatePipe],
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
  task: any;
  projectId: string | null = null;
  taskId: string | null = null;
  projectMembers: any[] = [];
  isProjectCreator: boolean = false;
  remainingTime: string = '';
  private alive = true;
  activityLog: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalLogs: number = 0;
  pageSize: number = 10;
  comments: any[] = [];
  newComment: string = '';
  isLoadingComments = false;

  //Add maxLength constant
  readonly maxCommentLength = 1000;

  // Add new properties
  editingCommentId: string | null = null;
  editCommentText: string = '';

  isLoading: boolean = false;

  hoveredMemberId: string | null = null;
  tooltipPosition = { x: 0, y: 0 };

  isLoadingActivity: boolean = false;

  // Add to existing properties
  reactionTypes = ['👍', '👎', '😄', '🎉', '😕', '❤️'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.route.params.subscribe((params) => {
      this.projectId = params['projectId'];
      this.taskId = params['taskId'];
      if (this.projectId && this.taskId) {
        this.loadTaskDetails();
        this.loadProjectMembers();
        this.checkProjectCreator();
        this.updateRemainingTime();
        this.startRemainingTimeCounter();
        this.loadActivityLog();
        this.loadComments();
      }
    });
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  loadTaskDetails(): void {
    if (this.projectId && this.taskId) {
      this.isLoading = true;
      this.cdr.detectChanges();

      this.projectService
        .getTaskDetails(this.projectId!, this.taskId!)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (task) => {
            this.task = task;
            this.updateRemainingTime();
            this.startRemainingTimeCounter();
            this.loadActivityLog();
          },
          error: (error) => {
            console.error('Error loading task details:', error);
          },
        });
    }
  }

  loadActivityLog(page: number = this.currentPage): void {
    if (this.projectId && this.taskId) {
      this.isLoadingActivity = true;
      this.cdr.detectChanges();

      this.projectService
        .getTaskActivityLog(this.projectId, this.taskId, page)
        .pipe(
          finalize(() => {
            this.isLoadingActivity = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (response) => {
            this.activityLog = response.logs;
            this.currentPage = response.currentPage;
            this.totalPages = response.totalPages;
            this.totalLogs = response.totalLogs;
          },
          error: (error) => {
            console.error('Error loading activity log:', error);
          }
        });
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.loadActivityLog(this.currentPage);
  }

  loadProjectMembers(): void {
    if (this.projectId) {
      this.projectService.getProjectDetails(this.projectId).subscribe({
        next: (project) => {
          this.projectMembers = project.members;
          console.log('Loaded Project Members:', this.projectMembers);
        },
        error: (error) => {
          console.error('Error loading project members:', error);
        },
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Not Started':
        return 'gray';
      case 'In Progress':
        return 'blue';
      case 'Stuck':
        return 'red';
      case 'Done':
        return 'green';
      default:
        return 'gray';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'low':
        return 'green';
      case 'medium':
        return 'orange';
      case 'high':
        return 'red';
      case 'critical':
        return 'purple';
      default:
        return 'gray';
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }

  deleteTask(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this task?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.projectId && this.taskId) {
        this.projectService.deleteTask(this.projectId, this.taskId).subscribe(
          () => {
            // Navigate back to the project details page or update the task list
            this.router.navigate(['/projects', this.projectId]);
          },
          (error) => {
            console.error('Error deleting task:', error);
          }
        );
      }
    });
  }

  editTask(): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '500px',
      data: { ...this.task, projectId: this.projectId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService
          .updateTask(this.projectId!, this.taskId!, result)
          .subscribe(
            (updatedTask) => {
              this.task = updatedTask;
              this.loadActivityLog();
            },
            (error) => {
              console.error('Error updating task:', error);
              // Show error message
            }
          );
      }
    });
  }

  getAssignedMemberNames(): string {
    if (
      !this.task ||
      !this.task.assignedTo ||
      !Array.isArray(this.task.assignedTo)
    ) {
      return 'No members assigned';
    }
    return this.task.assignedTo
      .filter((member: any) => member !== null && member !== undefined)
      .map((member: any) => {
        if (typeof member === 'object' && member !== null && member.username) {
          return member.username;
        } else if (typeof member === 'string') {
          const foundMember = this.projectMembers.find((m) => m._id === member);
          return foundMember ? foundMember.username : 'Unknown';
        }
        return 'Unknown';
      })
      .join(', ');
  }

  checkProjectCreator(): void {
    if (this.projectId) {
      this.projectService.getProjectDetails(this.projectId).subscribe({
        next: (project) => {
          const currentUserId = this.authService.getCurrentUserId();
          const projectCreatorId =
            typeof project.createdBy === 'object'
              ? project.createdBy._id
              : project.createdBy;

          if (currentUserId) {
            this.isProjectCreator =
              projectCreatorId.toString() === currentUserId.toString();
          } else {
            this.isProjectCreator = false;
          }
        },
        error: (error) => {
          console.error('Error checking project creator:', error);
        },
      });
    }
  }

  updateTaskStatus(newStatus: string): void {
    if (this.projectId && this.taskId && this.task) {
      this.projectService
        .updateTaskStatus(this.projectId, this.taskId, newStatus)
        .subscribe(
          (updatedTask) => {
            this.task.status = updatedTask.status;
            this.updateRemainingTime();
            this.loadActivityLog(1);
          },
          (error) => {
            console.error('Error updating task status:', error);
          }
        );
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-500 text-white';
      case 'In Progress':
        return 'bg-blue-500 text-white';
      case 'Stuck':
        return 'bg-red-500 text-white';
      case 'Done':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low':
        return 'bg-green-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'critical':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  updateRemainingTime(): void {
    if (this.task && this.task.timeline && this.task.timeline.end) {
      const endDate = new Date(this.task.timeline.end);
      const now = new Date();
      const timeDiff = endDate.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        this.remainingTime = `${days}d ${hours}h ${minutes}m`;
      } else {
        this.remainingTime = 'Overdue';
      }
    } else {
      this.remainingTime = 'No end date set';
    }
  }

  startRemainingTimeCounter(): void {
    interval(60000)
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => {
        this.updateRemainingTime();
      });
  }

  formatActivityAction(action: string): SafeHtml {
    if (!action) return '';

    // For timeline changes
    if (action.includes('timeline updated:')) {
      return this.sanitizer.bypassSecurityTrustHtml(
        action.replace(
          /(from\s)([^,\s]+)(\sto\s)([^,\s]+)/g,
          '$1<span class="text-red-500">$2</span>$3<span class="text-green-500">$4</span>'
        )
      );
    }

    // For other changes (status, priority, etc.)
    if (action.includes('changed from')) {
      return this.sanitizer.bypassSecurityTrustHtml(
        action.replace(
          /(changed from\s")(.*?)("\sto\s")(.*?)(")/g,
          '$1<span class="text-red-500">$2</span>$3<span class="text-green-500">$4</span>$5'
        )
      );
    }

    return action;
  }

  formatDateIfNeeded(value: string): string {
    // Check if the value is a valid date string (YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(value)) {
      // If it's a date, format it as DD/MM/YYYY
      return this.datePipe.transform(value, 'dd/MM/yyyy') || value;
    }
    return value;
  }

  goBack(): void {
    if (this.projectId) {
      this.router.navigate(['/projects', this.projectId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  loadComments(): void {
    if (this.projectId && this.taskId) {
      this.isLoadingComments = true;
      this.projectService
        .getTaskComments(this.projectId, this.taskId)
        .subscribe(
          (comments) => {
            this.comments = comments;
            this.isLoadingComments = false;
          },
          (error) => {
            console.error('Error loading comments:', error);
            this.isLoadingComments = false;
          }
        );
    }
  }

  addComment(): void {
    if (this.projectId && this.taskId && this.newComment?.trim()) {
      const commentContent = this.newComment.trim();
      this.newComment = '';

      this.projectService
        .addTaskComment(this.projectId, this.taskId, {
          content: commentContent,
        })
        .subscribe(
          (comment) => {
            this.comments.unshift(comment);
            this.loadActivityLog();
          },
          (error) => {
            console.error('Error adding comment:', error);
            // Optionally restore the comment text if there was an error
            this.newComment = commentContent;
          }
        );
    }
  }

  isCommentAuthor(comment: any): boolean {
    return comment.author?._id === this.authService.getCurrentUserId();
  }

  editComment(comment: any): void {
    this.editingCommentId = comment._id;
    this.editCommentText = comment.content;
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  saveEdit(comment: any): void {
    if (!this.editCommentText?.trim()) return;

    this.projectService
      .updateTaskComment(this.projectId!, this.taskId!, comment._id, {
        content: this.editCommentText.trim(),
      })
      .subscribe(
        (updatedComment) => {
          const index = this.comments.findIndex((c) => c._id === comment._id);
          if (index !== -1) {
            this.comments[index] = updatedComment;
          }
          this.cancelEdit();
        },
        (error) => {
          console.error('Error updating comment:', error);
        }
      );
  }

  deleteComment(comment: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete Comment',
        message: 'Are you sure you want to delete this comment?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService
          .deleteTaskComment(this.projectId!, this.taskId!, comment._id)
          .subscribe(
            () => {
              this.comments = this.comments.filter(
                (c) => c._id !== comment._id
              );
            },
            (error) => {
              console.error('Error deleting comment:', error);
            }
          );
      }
    });
  }

  getAssignedMembers(): any[] {
    if (!this.task?.assignedTo || !Array.isArray(this.task.assignedTo)) {
      return [];
    }

    return this.task.assignedTo
      .filter((member: any) => member !== null && member !== undefined)
      .map((member: any) => {
        if (typeof member === 'object' && member !== null && member.username) {
          return member;
        } else if (typeof member === 'string') {
          const foundMember = this.projectMembers.find((m) => m._id === member);
          return (
            foundMember || {
              _id: member,
              username: 'Unknown User',
              email: '',
              name: '',
              status: 'unknown',
            }
          );
        }
        return {
          username: 'Unknown User',
          email: '',
          name: '',
          status: 'unknown',
        };
      });
  }

  getMemberDetails(memberId: string | null) {
    if (!memberId) return null;
    const member = this.projectMembers.find((m) => m._id === memberId);
    return member
      ? {
          _id: member._id,
          username: member.username,
          email: member.email || 'No email available',
          name: member.name || 'No name available',
        }
      : null;
  }

  showMemberInfo(event: MouseEvent, memberId: string) {
    this.hoveredMemberId = memberId;

    // Calculate position relative to viewport
    const offset = 10; // Distance from cursor
    let x = event.clientX + offset;
    let y = event.clientY + offset;

    // Prevent tooltip from going off-screen
    const tooltipWidth = 288; // w-72 = 18rem = 288px
    const tooltipHeight = 200; // Approximate height of tooltip
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust X position if tooltip would go off right edge
    if (x + tooltipWidth > viewportWidth) {
      x = event.clientX - tooltipWidth - offset;
    }

    // Adjust Y position if tooltip would go off bottom edge
    if (y + tooltipHeight > viewportHeight) {
      y = event.clientY - tooltipHeight - offset;
    }

    this.tooltipPosition = { x, y };
  }

  hideMemberInfo() {
    this.hoveredMemberId = null;
  }

  // Add these new methods
  getReactionIcon(type: string): string {
    return type; // Simply return the emoji
  }

  hasUserReacted(comment: any, type: string): boolean {
    const userId = this.authService.getCurrentUserId();
    return comment.reactions?.some(
      (r: any) => r.user._id === userId && r.type === type
    ) || false;
  }

  getReactionCount(comment: any, type: string): number {
    return comment.reactions?.filter((r: any) => r.type === type).length || 0;
  }

  toggleReaction(comment: any, type: string): void {
    if (!this.projectId || !this.taskId) return;

    // Optimistically update the UI
    const userId = this.authService.getCurrentUserId();
    const existingReaction = comment.reactions?.find(
      (r: any) => r.user._id === userId && r.type === type
    );

    if (existingReaction) {
      comment.reactions = comment.reactions.filter(
        (r: any) => !(r.user._id === userId && r.type === type)
      );
    } else {
      if (!comment.reactions) comment.reactions = [];
      comment.reactions.push({
        type,
        user: { _id: userId }
      });
    }

    // Make API call
    this.projectService
      .toggleCommentReaction(this.projectId, this.taskId, comment._id, type)
      .subscribe(
        (updatedComment) => {
          const index = this.comments.findIndex(c => c._id === comment._id);
          if (index !== -1) {
            this.comments[index] = updatedComment;
          }
        },
        (error) => {
          console.error('Error toggling reaction:', error);
          // Revert optimistic update on error
          this.loadComments();
        }
      );
  }

  hasAnyReactions(comment: any): boolean {
    return comment.reactions?.length > 0;
  }

  getExistingReactionTypes(comment: any): string[] {
    if (!comment.reactions) return [];
    return Array.from(new Set(comment.reactions.map((r: any) => r.type)));
  }

  getTotalReactions(comment: any): number {
    return comment.reactions?.length || 0;
  }

  getActivityClass(activity: any): string {
    if (activity.type === 'status_change') {
      return `status-change to-${activity.newValue.toLowerCase().replace(' ', '-')}`;
    }
    if (activity.type === 'priority_change') {
      return `priority-change to-${activity.newValue.toLowerCase()}`;
    }
    return '';
  }
}
