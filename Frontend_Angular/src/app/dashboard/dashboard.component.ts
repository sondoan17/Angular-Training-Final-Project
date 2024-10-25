import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectDialogComponent } from './create-project-dialog/create-project-dialog.component';
import { ProjectService, Project } from '../services/project.service';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { EditProjectDialogComponent } from '../project-details/edit-project-dialog/edit-project-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatIconModule,
    RouterLink,
    RouterModule,
    EditProjectDialogComponent,
    MatSnackBarModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  userProjects: Project[] = [];

  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUserProjects();
  }

  loadUserProjects() {
    this.projectService.getUserProjects().subscribe({
      next: (projects: Project[]) => {
        this.userProjects = projects;
      },
      error: (error) => {
        console.error('Error loading user projects:', error);
        if (error.error instanceof ErrorEvent) {
          console.error('Client-side error:', error.error.message);
        } else {
          console.error(
            `Backend returned code ${error.status}, body was:`,
            error.error
          );
        }
      },
    });
  }

  openCreateProjectDialog() {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService.createProject(result).subscribe({
          next: () => {
            this.loadUserProjects();
          },
          error: (error) => {
            console.error('Error creating project:', error);
          },
        });
      }
    });
  }

  openEditProjectDialog(project: Project) {
    const dialogRef = this.dialog.open(EditProjectDialogComponent, {
      width: '400px',
      data: { project },
    });
  }

  deleteProject(project: Project) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the project "${project.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.deleteProject(project._id).subscribe({
          next: () => {
            this.loadUserProjects();
            this.snackBar.open('Project deleted successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (error) => {
            console.error('Error deleting project:', error);
            this.snackBar.open('Error deleting project', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  editProject(project: Project) {
    const dialogRef = this.dialog.open(EditProjectDialogComponent, {
      width: '300px',
      data: {
        name: project.name,
        description: project.description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService.updateProject(project._id, result).subscribe({
          next: (updatedProject) => {
            console.log('Project updated:', updatedProject);
            const index = this.userProjects.findIndex(
              (p) => p._id === updatedProject._id
            );
            if (index !== -1) {
              this.userProjects[index] = updatedProject;
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
    });
  }
}
