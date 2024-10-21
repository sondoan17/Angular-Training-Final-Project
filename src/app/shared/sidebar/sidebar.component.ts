import { Component, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectDialogComponent } from '../../dashboard/create-project-dialog/create-project-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  projects: any[] = [];
  favorites: any[] = [
    { name: 'Adrian Bert - CRM Da...' },
    { name: 'Trust - SaaS Dashbo...' },
    { name: 'Pertamina Project' },
    { name: 'Garuda Project' }
  ];

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getUserProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  addNewProject() {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.createProject(result).subscribe({
          next: () => {
            this.loadProjects();
          },
          error: (error) => {
            console.error('Error creating project:', error);
          }
        });
      }
    });
  }

 
}
