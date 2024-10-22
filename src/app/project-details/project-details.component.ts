import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../services/project.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectMembersDialogComponent } from './project-members-dialog/project-members-dialog.component';
import { EditProjectDialogComponent } from './edit-project-dialog/edit-project-dialog.component';
import { CreateTaskDialogComponent } from './create-task-dialog/create-task-dialog.component';
import { MatListModule } from '@angular/material/list';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    SidebarComponent,
    MatSidenavModule,
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
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
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

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,

    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
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
        },
        error: (error) => {
          console.error('Error loading project:', error);
        },
      });
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
        projectId: this.project._id,
        creatorId: this.project.creator,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.action === 'add') {
          this.addMemberToProject(result.username);
        } else if (result.action === 'remove') {
          this.removeMemberFromProject(result.memberId);
        }
      }
    });
  }

  removeMemberFromProject(memberId: string) {
    this.projectService
      .removeMemberFromProject(this.project._id, memberId)
      .subscribe({
        next: (updatedProject) => {
          this.project = updatedProject;
          this.snackBar.open('Member removed successfully', 'Close', {
            duration: 3000,
          });
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
          // this.router.navigate(['/projects', this.project._id, 'tasks', newTask._id]);
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
    this.projectService
      .updateTaskStatus(this.project._id, event.task._id, event.newStatus)
      .subscribe({
        next: (updatedTask) => {
          const taskIndex = this.project.tasks.findIndex(
            (t: any) => t._id === updatedTask._id
          );
          if (taskIndex !== -1) {
            this.project.tasks[taskIndex] = updatedTask;
          }
        },
        error: (error) => console.error('Error updating task:', error),
      });
  }

  // Thêm phương thức mới để cập nhật Kanban board
  updateKanbanBoard() {
    if (this.kanbanBoard) {
      this.kanbanBoard.tasks = this.project.tasks;
      this.kanbanBoard.distributeTasksToColumns();
    }
  }
}
