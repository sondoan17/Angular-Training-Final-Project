// Angular Core
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Angular Router
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

// RxJS
import { switchMap } from 'rxjs/operators';

// Angular Material
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Chart.js
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';

// Services
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

// Components
import { AddMemberDialogComponent } from './add-member-dialog/add-member-dialog.component';
import { CreateTaskDialogComponent } from './create-task-dialog/create-task-dialog.component';
import { EditProjectDialogComponent } from './edit-project-dialog/edit-project-dialog.component';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import { ProjectMembersDialogComponent } from './project-members-dialog/project-members-dialog.component';
import { TaskDetailsDialogComponent } from './task-details-dialog/task-details-dialog.component';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    AddMemberDialogComponent,
    MatSnackBarModule,
    ProjectMembersDialogComponent,
    EditProjectDialogComponent,
    CreateTaskDialogComponent,
    MatListModule,
    KanbanBoardComponent,
    MatPaginatorModule,
    NgChartsModule,
    ScrollingModule,
    MatProgressSpinnerModule,
    TaskDetailsDialogComponent,
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent implements OnInit {
  isLoading: boolean = true;
  project: any;
  error: string | null = null;
  sidebarOpen = false;
  editMode = false;
  editedProject: { name: string; description: string } = {
    name: '',
    description: '',
  };

  @ViewChild('sidenav') sidenav!: MatSidenav;

  @ViewChild(KanbanBoardComponent) kanbanBoard!: KanbanBoardComponent;

  activityLog: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalLogs: number = 0;
  pageSize: number = 5;

  currentUser: { _id: string; username: string } | null = null;

  isActivityLogVisible: boolean = false;

  chartData: ChartData<'bar'> = {
    labels: ['Not Started', 'In Progress', 'Stuck', 'Done'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#D1D5DB', '#61A5FA', '#F87071', '#4BDE80'],
        borderColor: ['#9CA3AF', '#3B82F6', '#EF4444', '#34D399'],
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: ['#D1D5DB', '#61A5FA', '#F87071', '#4BDE80'],
        hoverBorderColor: ['#9CA3AF', '#3B82F6', '#EF4444', '#34D399'],
        hoverBorderWidth: 1,
      },
    ],
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 4,
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart',
    },
    transitions: {
      active: {
        animation: {
          duration: 750,
        },
      },
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      bar: {
        hoverBackgroundColor: ['#D1D5DB', '#61A5FA', '#F87071', '#4BDE80'],
        borderRadius: 4,
      },
    },
  };

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  isLoadingActivityLog: boolean = false;

  itemSize: number = 0; // height of list items

  isProjectCreator: boolean = false;

  isChartLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      const projectId = params['id'];
      if (projectId) {
        this.projectService.getProjectDetails(projectId).subscribe({
          next: (project) => {
            this.project = project;
            const currentUserId = this.authService.getCurrentUserId();
            this.isProjectCreator = currentUserId === project.createdBy._id;
            this.prepareChartData();
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          },
          error: (error) => {
            console.error('Error loading project:', error);
            this.error = 'Error loading project details';
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          },
        });
      }
    });

    // Get current user information
    this.currentUser = {
      _id: this.authService.getCurrentUserId() ?? '',
      username: this.authService.getCurrentUsername(),
    };

    this.prepareChartData();
  }

  getCreatorUsername(): string {
    if (this.project?.createdBy) {
      return typeof this.project.createdBy === 'object'
        ? this.project.createdBy.username
        : this.project.createdBy;
    }
    return 'Unknown';
  }

  toggleSidebar() {
    this.sidenav.toggle();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.editedProject = {
        name: this.project.name,
        description: this.project.description,
      };
    }
  }

  openAddMemberDialog() {
    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addMemberToProject(result);
      }
    });
  }

  addMemberToProject(username: string) {
    this.projectService
      .addMemberToProject(this.project._id, username)
      .subscribe({
        next: (updatedProject) => {
          this.project = updatedProject;
          this.snackBar.open('Member added successfully', 'Close', {
            duration: 3000,
          });

          // Add a new activity log entry locally
          if (this.currentUser) {
            const newLogEntry = {
              action: `Member ${username} added to the project`,
              performedBy: this.currentUser,
              timestamp: new Date(),
            };
            this.activityLog.unshift(newLogEntry);
            if (this.activityLog.length > this.pageSize) {
              this.activityLog.pop();
            }
            this.totalLogs++;
          }
        },
        error: (error) => {
          console.error('Error adding member:', error);
          this.snackBar.open('Error adding member', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  openMembersDialog() {
    const dialogRef = this.dialog.open(ProjectMembersDialogComponent, {
      width: '300px',
      data: {
        members: this.project.members,
        creatorId: this.project.createdBy._id,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.action === 'add') {
          this.addMemberToProject(result.username);
        } else if (result.action === 'remove') {
          if (result.memberId !== this.project.createdBy._id) {
            this.removeMemberFromProject(result.memberId);
          } else {
            this.snackBar.open('Cannot remove the project creator', 'Close', {
              duration: 3000,
            });
          }
        }
      }
    });
  }

  removeMemberFromProject(memberId: string) {
    // Find the member's username before removing
    const memberToRemove = this.project.members.find(
      (member: any) => member._id === memberId
    );
    const memberUsername = memberToRemove
      ? memberToRemove.username
      : 'Unknown user';

    this.projectService
      .removeMemberFromProject(this.project._id, memberId)
      .subscribe({
        next: (updatedProject) => {
          this.project = updatedProject;
          this.snackBar.open('Member removed successfully', 'Close', {
            duration: 3000,
          });

          // Add a new activity log entry locally
          if (this.currentUser) {
            const newLogEntry = {
              action: `Member ${memberUsername} removed from the project`,
              performedBy: this.currentUser,
              timestamp: new Date(),
            };
            this.activityLog.unshift(newLogEntry);
            if (this.activityLog.length > this.pageSize) {
              this.activityLog.pop();
            }
            this.totalLogs++;
          }
        },
        error: (error) => {
          console.error('Error removing member:', error);
          this.snackBar.open('Error removing member', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  openEditProjectDialog() {
    const dialogRef = this.dialog.open(EditProjectDialogComponent, {
      width: '300px',
      data: {
        name: this.project.name,
        description: this.project.description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveChanges(result);
      }
    });
  }

  saveChanges(editedProject: { name: string; description: string }) {
    const originalProject = { ...this.project };
    this.projectService
      .updateProject(this.project._id, editedProject)
      .subscribe({
        next: (updatedProject) => {
          this.project = updatedProject;
          if (
            typeof this.project.createdBy === 'object' &&
            this.project.createdBy !== null
          ) {
            this.project.createdBy = {
              _id: this.project.createdBy._id,
              username: this.project.createdBy.username,
            };
          }
          this.snackBar.open('Project updated successfully', 'Close', {
            duration: 3000,
          });

          // Generate changelog
          const changes = [];
          if (originalProject.name !== editedProject.name) {
            changes.push(
              `name changed from "${originalProject.name}" to "${editedProject.name}"`
            );
          }
          if (originalProject.description !== editedProject.description) {
            changes.push(
              `description changed from "${originalProject.description}" to "${editedProject.description}"`
            );
          }

          // Add a new activity log entry locally
          if (this.currentUser) {
            const newLogEntry = {
              action: `Project updated: ${changes.join(', ')}`,
              performedBy: this.currentUser,
              timestamp: new Date(),
            };
            this.activityLog.unshift(newLogEntry);
            if (this.activityLog.length > this.pageSize) {
              this.activityLog.pop();
            }
            this.totalLogs++;
          } else {
            console.error('Current user information is not available');
          }
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.snackBar.open('Error updating project', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  openCreateTaskDialog() {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      width: '500px',
      data: { members: this.project.members },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createTask(result);
      }
    });
  }

  createTask(taskData: any) {
    this.projectService.createTask(this.project._id, taskData).subscribe({
      next: (newTask) => {
        if (newTask && newTask._id) {
          this.project.tasks.push(newTask);
          this.updateKanbanBoard();
          this.snackBar.open('Task created successfully', 'Close', {
            duration: 3000,
          });
          this.loadActivityLog(1); // Refresh activity log and reset to first page
        } else {
          this.snackBar.open('Task created, but no _id returned', 'Close', {
            duration: 3000,
          });
        }
      },
      error: (error) => {
        this.snackBar.open('Error creating task', 'Close', { duration: 3000 });
      },
    });
  }

  getAssignedUsername(userId: string): string {
    const assignedMember = this.project.members.find(
      (member: any) => member._id === userId
    );
    return assignedMember ? assignedMember.username : 'Unassigned';
  }

  onTaskMoved(event: { task: any; newStatus: string }) {
    if (!this.isProjectCreator) {
      this.snackBar.open('Only project creator can move tasks', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      this.updateKanbanBoard();
      return;
    }

    const { task, newStatus } = event;

    this.projectService
      .updateTaskStatus(this.project._id, task._id, newStatus)
      .subscribe({
        next: (updatedTask) => {
          const taskIndex = this.project.tasks.findIndex(
            (t: any) => t._id === task._id
          );
          if (taskIndex !== -1) {
            this.project.tasks[taskIndex] = {
              ...this.project.tasks[taskIndex],
              ...updatedTask,
              assignedTo: this.project.tasks[taskIndex].assignedTo
            };

            this.updateChartData();
            this.loadActivityLog(1);

            if (this.kanbanBoard) {
              this.kanbanBoard.distributeTasksToColumns();
            }

            this.changeDetectorRef.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          this.updateKanbanBoard();
          this.snackBar.open('Failed to update task status', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  updateKanbanBoard() {
    if (this.kanbanBoard && this.project) {
      this.kanbanBoard.tasks = this.project.tasks;
      this.kanbanBoard.distributeTasksToColumns();
      this.updateChartData();
    }
  }

  updateChartData() {
    this.prepareChartData();
  }

  prepareChartData() {
    if (!this.project || !this.project.tasks) {
      console.warn('Project or tasks not loaded yet');
      return;
    }

    // Set chart loading state
    this.isChartLoading = true;
    this.changeDetectorRef.detectChanges();

    try {
      const taskStatuses = ['Not Started', 'In Progress', 'Stuck', 'Done'];
      const statusCounts = taskStatuses.map(
        (status) =>
          this.project.tasks.filter((task: any) => task.status === status)
            .length
      );

      this.chartData.datasets[0].data = statusCounts;

      if (this.chart) {
        this.chart.update();
      }
    } finally {
      this.isChartLoading = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  loadActivityLog(page: number = this.currentPage): void {
    if (this.project && this.project._id && !this.isLoadingActivityLog) {
      this.isLoadingActivityLog = true;
      this.changeDetectorRef.detectChanges();

      this.projectService
        .getProjectActivityLog(this.project._id, page, this.pageSize)
        .subscribe({
          next: (response) => {
            this.activityLog = response.logs;
            this.currentPage = response.currentPage;
            this.totalPages = response.totalPages;
            this.totalLogs = response.totalLogs;
            this.isLoadingActivityLog = false;
            this.changeDetectorRef.detectChanges();
          },
          error: (error) => {
            console.error('Error loading activity log:', error);
            this.isLoadingActivityLog = false;
            this.snackBar.open('Error loading activity log', 'Close', {
              duration: 3000,
            });
            this.changeDetectorRef.detectChanges();
          },
        });
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadActivityLog(this.currentPage);
  }

  formatActivityAction(action: string): string {
    const changes = action.split('. ');

    const formattedChanges = changes.map((change) => {
      if (change.includes('changed from')) {
        const [field, values] = change.split(' changed from ');
        const [oldValue, newValue] = values.split(' to ');
        return `<strong>${field}</strong> changed from <span class="text-red-500">${this.formatDateIfNeeded(
          oldValue
        )}</span> to <span class="text-green-500">${this.formatDateIfNeeded(
          newValue
        )}</span>`;
      } else if (change.includes('Added members:')) {
        return (
          change.replace(
            'Added members:',
            '<strong>Added members:</strong> <span class="text-green-500">'
          ) + '</span>'
        );
      } else if (change.includes('Removed members:')) {
        return (
          change.replace(
            'Removed members:',
            '<strong>Removed members:</strong> <span class="text-red-500">'
          ) + '</span>'
        );
      } else {
        return `<strong>${change}</strong>`;
      }
    });

    return formattedChanges.join('<br>');
  }

  formatDateIfNeeded(value: string): string {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(value)) {
      return this.datePipe.transform(value, 'dd/MM/yyyy') || value;
    }
    return value;
  }

  toggleActivityLog() {
    this.isActivityLogVisible = !this.isActivityLogVisible;
    if (
      this.isActivityLogVisible &&
      (!this.activityLog || this.activityLog.length === 0)
    ) {
      this.loadActivityLog();
    }
  }

  getTaskCountByStatus(status: string): number {
    return this.project.tasks.filter((task: any) => task.status === status)
      .length;
  }

  getProjectDuration(): string {
    const start = new Date(this.project.createdAt);
    const end = new Date();
    const durationInDays = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
    );
    return `${durationInDays} days`;
  }

  getCompletionRate(): number {
    const completedTasks = this.getTaskCountByStatus('Done');
    const totalTasks = this.project.tasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }

  getDaysRemaining(): number {
    if (!this.project.dueDate) {
      return 0;
    }
    const today = new Date();
    const dueDate = new Date(this.project.dueDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  trackByActivityId(index: number, activity: any): string {
    return activity._id;
  }

  trackByTaskId(index: number, task: any): string {
    return task._id;
  }

  openTaskDetailsDialog(task: any) {
    const dialogRef = this.dialog.open(TaskDetailsDialogComponent, {
      width: '95vw',
      maxWidth: '800px',
      panelClass: 'task-details-dialog',
      data: {
        task: task,
        projectId: this.project._id,
        projectMembers: this.project.members,
        isProjectCreator: this.isProjectCreator,
      }
    });
  }
}
