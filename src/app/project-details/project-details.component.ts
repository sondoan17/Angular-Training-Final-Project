import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule
  ],
  providers: [MatSnackBar],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  project: any;
  error: string | null = null;
  sidebarOpen = false;
  editMode = false;
  editedProject: { name: string; description: string } = { name: '', description: '' };

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProjectDetails(id);
    } else {
      this.error = 'No project ID provided.';
    }
  }

  private fetchProjectDetails(id: string) {
    this.projectService.getProjectDetails(id).subscribe({
      next: (data) => {
        this.project = data;
        this.editedProject = { name: this.project.name, description: this.project.description };
        // Ensure members is an array
        this.project.members = this.project.members || [];
      },
      error: (error) => {
        console.error('Error fetching project details:', error);
        this.error = 'Failed to load project details. Please try again later.';
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
    this.location.back();
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Reset edited values if canceling edit
      this.editedProject = { name: this.project.name, description: this.project.description };
    }
  }

  saveChanges() {
    this.projectService.updateProject(this.project._id, this.editedProject).subscribe({
      next: (updatedProject) => {
        this.project = updatedProject;
        this.editMode = false;
      },
      error: (error) => {
        console.error('Error updating project:', error);
        // Handle error (e.g., show error message to user)
      }
    });
  }

  openAddMemberDialog() {
    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addMemberToProject(result);
      }
    });
  }

  addMemberToProject(username: string) {
    this.projectService.addMemberToProject(this.project._id, username).subscribe(
      updatedProject => {
        this.project = updatedProject;
        // Ensure members is an array after update
        this.project.members = this.project.members || [];
        console.log('Member added successfully');
        // You can add a success message here if you want
      },
      error => {
        console.error('Error adding member to project:', error);
        if (error.error && error.error.message) {
          console.error('Server error message:', error.error.message);
        }
        // You can add an error message here if you want
      }
    );
  }
}
