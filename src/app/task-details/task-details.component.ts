import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from './edit-task-dialog/edit-task-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../services/auth.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    SidebarComponent,
    NavbarComponent,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    EditTaskDialogComponent,
    MatMenuModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css'],
})
export class TaskDetailsComponent implements OnInit {
  task: any;
  projectId: string | null = null;
  taskId: string | null = null;
  projectMembers: any[] = [];
  isProjectCreator: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.projectId = params['projectId'];
      this.taskId = params['taskId'];
      if (this.projectId && this.taskId) {
        this.loadTaskDetails();
        this.loadProjectMembers();
        this.checkProjectCreator();
      }
    });
  }

  loadTaskDetails(): void {
    if (this.projectId && this.taskId) {
      this.projectService
        .getTaskDetails(this.projectId!, this.taskId!)
        .subscribe(
          (task) => {
            this.task = task;
            console.log('Loaded task:', this.task); // Add this line for debugging
          },
          (error) => {
            console.error('Error loading task details:', error);
          }
        );
    }
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
      data: { ...this.task, projectId: this.projectId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService
          .updateTask(this.projectId!, this.taskId!, result)
          .subscribe(
            (updatedTask) => {
              this.task = updatedTask;
              // Optionally, show a success message
            },
            (error) => {
              console.error('Error updating task:', error);
              // Handle error (e.g., show an error message to the user)
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
          const projectCreatorId = project.createdBy;
          if (currentUserId) {
            this.isProjectCreator =
              projectCreatorId._id.toString() === currentUserId.toString();
          } else {
            this.isProjectCreator = false;
            console.warn(
              'ID not available.'
            );
          }
        },
        (error) => {
          console.error('Error checking project creator:', error);
        }
      );
    }
  }

  updateTaskStatus(newStatus: string): void {
    if (this.projectId && this.taskId) {
      this.projectService
        .updateTaskStatus(this.projectId, this.taskId, newStatus)
        .subscribe(
          (updatedTask) => {
            this.task = updatedTask;
          },
          (error) => {
            console.error('Error updating task status:', error);
          }
        );
    }
  }
}
