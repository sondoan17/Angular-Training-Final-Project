import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectDialogComponent } from '../../dashboard/create-project-dialog/create-project-dialog.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    RouterModule,
    RouterLink,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() sidebarClosed = new EventEmitter<void>();
  projects: any[] = [];
  favorites: any[] = [
    { name: 'Adrian Bert - CRM Da...' },
    { name: 'Trust - SaaS Dashbo...' },
    { name: 'Pertamina Project' },
    { name: 'Garuda Project' },
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
      },
    });
  }

  addNewProject() {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService.createProject(result).subscribe({
          next: () => {
            this.loadProjects();
          },
          error: (error) => {
            console.error('Error creating project:', error);
          },
        });
      }
    });
  }

  closeSidebar() {
    this.isOpen = false;
    this.sidebarClosed.emit();
  }
}
