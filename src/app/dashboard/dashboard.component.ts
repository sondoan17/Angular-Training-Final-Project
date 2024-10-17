import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectDialogComponent } from './create-project-dialog/create-project-dialog.component';
import { ProjectService } from '../services/project.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    SidebarComponent,
    MatSidenavModule,
    MatButtonModule,
    MatListModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  userProjects: any[] = [];

  constructor(private dialog: MatDialog, private projectService: ProjectService) {}

  ngOnInit() {
    this.loadUserProjects();
  }

  loadUserProjects() {
    this.projectService.getUserProjects().subscribe({
      next: (projects) => {
        this.userProjects = projects;
      
      },
      error: (error) => {
        console.error('Error loading user projects:', error);
      }
    });
  }

  openCreateProjectDialog() {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.createProject(result).subscribe({
          next: (response) => {
        
            this.loadUserProjects(); // Reload projects after creating a new one
          },
          error: (error) => {
        
          }
        });
      }
    });
  }
}
