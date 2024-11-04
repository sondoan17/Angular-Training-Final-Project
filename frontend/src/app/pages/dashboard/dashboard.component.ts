import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectDialogComponent } from './create-project-dialog/create-project-dialog.component';
import { ProjectService, Project } from '../../services/project.service';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { EditProjectDialogComponent } from '../project-details/edit-project-dialog/edit-project-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../services/auth.service';

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
  createdProjects: Project[] = [];
  memberProjects: Project[] = [];

  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUserProjects();
  }

  loadUserProjects() {
    const currentUserId = this.authService.getCurrentUserId();

    if (!currentUserId) {
      console.error('No user ID found - redirecting to login');
      return;
    }

    this.projectService.getUserProjects().subscribe({
      next: (projects: Project[]) => {
        this.createdProjects = projects.filter(project => 
          project.createdBy && project.createdBy._id === currentUserId
        );
        
        this.memberProjects = projects.filter(project => 
          project.createdBy && 
          project.createdBy._id !== currentUserId && 
          project.members?.some(member => member._id === currentUserId)
        );
      },
      error: (error) => {
        console.error('Error loading user projects:', error);
        this.snackBar.open('Error loading projects', 'Close', {
          duration: 3000,
        });
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
            this.snackBar.open('Error creating project', 'Close', {
              duration: 3000,
            });
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
            const index = this.createdProjects.findIndex(
              (p) => p._id === updatedProject._id
            );
            if (index !== -1) {
              this.createdProjects[index] = updatedProject;
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
