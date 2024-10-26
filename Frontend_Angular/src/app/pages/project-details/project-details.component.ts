import { Component, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberDialogComponent } from './add-member-dialog/add-member-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectMembersDialogComponent } from './project-members-dialog/project-members-dialog.component';
import { EditProjectDialogComponent } from './edit-project-dialog/edit-project-dialog.component';
import { CreateTaskDialogComponent } from './create-task-dialog/create-task-dialog.component';
import { MatListModule } from '@angular/material/list';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import { switchMap } from 'rxjs/operators';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush // Add this line
})
export class ProjectDetailsComponent implements OnInit {
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

  chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: {
            size: 10,
          },
        },
      },
      title: {
        display: false,
      },
    },
    animation: {
      duration: 0
    },
    transitions: {
      active: {
        animation: {
          duration: 0
        }
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    }
  };

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  isLoadingActivityLog: boolean = false;

  itemSize: number = 0; // Adjust this value based on the actual height of your list items

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
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id = params.get('id');
          return this.projectService.getProjectDetails(id!);
        })
      )
      .subscribe({
        next: (project) => {
          this.project = project;
          this.loadActivityLog();
          this.prepareChartData(); // Move this here
        },
        error: (error) => {
          console.error('Error loading project:', error);
        },
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
        creatorId: this.project.createdBy._id, // Ensure this is correctly set
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.action === 'add') {
          this.addMemberToProject(result.username);
        } else if (result.action === 'remove') {
          // Add an additional check here
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
    const { task, newStatus } = event;
    const taskIndex = this.project.tasks.findIndex((t: any) => t._id === task._id);
    if (taskIndex !== -1) {
      this.project.tasks[taskIndex].status = newStatus;
      this.updateChartData();
      
      // Fetch the latest activity log entry
      this.projectService.getProjectActivityLog(this.project._id, 1, 1).subscribe(
        (response) => {
          if (response.logs && response.logs.length > 0) {
            // Add the new activity log entry to the beginning of the array
            this.activityLog.unshift(response.logs[0]);
            
            // If we're showing a limited number of logs, remove the last one
            if (this.activityLog.length > this.pageSize) {
              this.activityLog.pop();
            }
            
            // Update total logs count
            this.totalLogs++;
            
            // Trigger change detection
            this.changeDetectorRef.detectChanges();
          }
        },
        (error) => {
          console.error('Error fetching latest activity log:', error);
        }
      );
    }
  }

  updateKanbanBoard() {
    if (this.kanbanBoard && this.project) {
      this.kanbanBoard.tasks = this.project.tasks;
      this.kanbanBoard.distributeTasksToColumns();
      this.updateChartData();
    }
  }

  updateChartData() {
    if (!this.project || !this.project.tasks) {
      console.warn('Project or tasks not loaded yet');
      return;
    }

    const taskStatuses = ['Not Started', 'In Progress', 'Stuck', 'Done'];
    const statusCounts = taskStatuses.map(
      (status) => this.project.tasks.filter((task: any) => task.status === status).length
    );

    if (this.chartData && this.chartData.datasets && this.chartData.datasets[0]) {
      this.chartData.datasets[0].data = statusCounts;
      
      if (this.chart && this.chart.chart) {
        this.chart.chart.update();
      }
    }
  }

  loadActivityLog(page: number = this.currentPage): void {
    if (this.project && this.project._id && !this.isLoadingActivityLog) {
      this.isLoadingActivityLog = true;
      this.projectService
        .getProjectActivityLog(this.project._id, page, this.pageSize)
        .subscribe(
          (response) => {
            console.log('Loaded activity log:', response);
            this.activityLog = response.logs;
            this.currentPage = response.currentPage;
            this.totalPages = response.totalPages;
            this.totalLogs = response.totalLogs;
            this.isLoadingActivityLog = false;
            
            console.log('Number of items received:', this.activityLog.length);
            
            // Force view update
            this.changeDetectorRef.detectChanges();
          },
          (error) => {
            console.error('Error loading activity log:', error);
            this.isLoadingActivityLog = false;
            this.changeDetectorRef.detectChanges();
          }
        );
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
        return `<strong>${field}</strong> changed from <span class="text-red-500">${this.formatDateIfNeeded(oldValue)}</span> to <span class="text-green-500">${this.formatDateIfNeeded(newValue)}</span>`;
      } else if (change.includes('Added members:')) {
        return change.replace('Added members:', '<strong>Added members:</strong> <span class="text-green-500">') + '</span>';
      } else if (change.includes('Removed members:')) {
        return change.replace('Removed members:', '<strong>Removed members:</strong> <span class="text-red-500">') + '</span>';
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
    if (this.isActivityLogVisible && (!this.activityLog || this.activityLog.length === 0)) {
      this.loadActivityLog();
    }
  }

  prepareChartData() {
    if (!this.project || !this.project.tasks) {
      console.warn('Project or tasks not loaded yet');
      return;
    }

    const taskStatuses = ['Not Started', 'In Progress', 'Stuck', 'Done'];
    const statusCounts = taskStatuses.map(
      (status) => this.project.tasks.filter((task: any) => task.status === status).length
    );

    this.chartData = {
      labels: taskStatuses,
      datasets: [
        {
          data: statusCounts,
          backgroundColor: ['#D1D5DB', '#61A5FA', '#F87071', '#4BDE80'],
          hoverBackgroundColor: ['#D1D5DB', '#61A5FA', '#F87071', '#4BDE80'],
        },
      ],
    };

    // If the chart is already initialized, update it
    if (this.chart && this.chart.chart) {
      this.chart.chart.update();
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
      return 0; // or handle this case as appropriate for your application
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
}
