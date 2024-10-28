import { Component, OnInit, OnDestroy } from '@angular/core';
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
  ],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css'],
  providers: [DatePipe] // Add DatePipe to providers
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
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
      }
    });
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  loadTaskDetails(): void {
    if (this.projectId && this.taskId) {
      this.projectService.getTaskDetails(this.projectId!, this.taskId!).subscribe(
        (task) => {
          console.log('Loaded task details:', task);
          this.task = task;
          this.updateRemainingTime();
          this.startRemainingTimeCounter();
          this.loadActivityLog();
        },
        (error) => {
          console.error('Error loading task details:', error);
        }
      );
    }
  }

  loadActivityLog(page: number = this.currentPage): void {
    if (this.projectId && this.taskId) {
      this.projectService.getTaskActivityLog(this.projectId, this.taskId, page).subscribe(
        (response) => {
          console.log('Loaded activity log:', response);
          this.activityLog = response.logs;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.totalLogs = response.totalLogs;
        },
        (error) => {
          console.error('Error loading activity log:', error);
        }
      );
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.loadActivityLog(this.currentPage);
  }

  loadProjectMembers(): void {
    if (this.projectId) {
      this.projectService.getProjectDetails(this.projectId!).subscribe(
        (project) => {
          this.projectMembers = project.members;
        },
        (error) => {
          console.error('Error loading project members:', error);
        }
      );
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
            // Handle error (e.g., show an error message to the user)
          }
        );
      }
    });
  }

  editTask(): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '500px',
      data: { ...this.task, projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.updateTask(this.projectId!, this.taskId!, result).subscribe(
          updatedTask => {
            this.task = updatedTask;
            this.loadActivityLog(); // This will now use the current page
            // Show success message
          },
          error => {
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
      this.projectService.getProjectDetails(this.projectId).subscribe(
        (project) => {
          const currentUserId = this.authService.getCurrentUserId();
          const projectCreatorId = typeof project.createdBy === 'object' ? project.createdBy._id : project.createdBy;
          
          
          
          if (currentUserId) {
            this.isProjectCreator = projectCreatorId.toString() === currentUserId.toString();
          } else {
            this.isProjectCreator = false;
            console.warn('Current user ID not available.');
          }
          
      
        },
        (error) => {
          console.error('Error checking project creator:', error);
        }
      );
    }
  }

  updateTaskStatus(newStatus: string): void {
    if (this.projectId && this.taskId && this.task) {
      this.projectService.updateTaskStatus(this.projectId, this.taskId, newStatus).subscribe(
        (updatedTask) => {
          this.task.status = updatedTask.status;
          this.updateRemainingTime();
          // Reload activity log after updating task status
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
    // Split the action string into separate changes
    const changes = action.split('. ');
    
    // Format each change
    const formattedChanges = changes.map(change => {
      if (change.includes('changed from')) {
        const [field, values] = change.split(' changed from ');
        const [oldValue, newValue] = values.split(' to ');
        return `<strong>${field}</strong> changed from <span class="text-red-500">${this.formatDateIfNeeded(oldValue)}</span> to <span class="text-green-500">${this.formatDateIfNeeded(newValue)}</span>`;
      } else if (change.includes('Added members:')) {
        return change.replace('Added members:', '<strong>Added members:</strong> <span class="text-green-500">') + '</span>';
      } else if (change.includes('Removed members:')) {
        return change.replace('Removed members:', '<strong>Removed members:</strong> <span class="text-red-500">') + '</span>';
      } else {
        return `<strong>${change}</strong>`;
      }
    });

    // Join the formatted changes and sanitize the HTML
    return this.sanitizer.bypassSecurityTrustHtml(formattedChanges.join('<br>'));
  }

  formatDateIfNeeded(value: string): string {
    // Check if the value is a valid date string (YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(value)) {
      // If it's a date, format it as DD/MM/YYYY
      return this.datePipe.transform(value, 'dd/MM/yyyy') || value;
    }
    // If it's not a date, return the original value
    return value;
  }

  goBack(): void {
    if (this.projectId) {
      this.router.navigate(['/projects', this.projectId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
