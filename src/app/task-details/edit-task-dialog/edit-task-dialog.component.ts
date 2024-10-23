import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-edit-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.css']
})
export class EditTaskDialogComponent implements OnInit {
  projectMembers: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadProjectMembers();
  }

  loadProjectMembers() {
    this.projectService.getProjectDetails(this.data.projectId).subscribe(
      project => {
        this.projectMembers = project.members;
        // Ensure that data.assignedTo contains only valid IDs
        this.data.assignedTo = (this.data.assignedTo || [])
          .filter((member: any) => member != null)
          .map((member: any) => {
            if (typeof member === 'object' && member._id) {
              return member._id;
            } else if (typeof member === 'string') {
              return member;
            }
            return null;
          })
          .filter((id: string | null) => id != null);
      },
      error => {
        console.error('Error loading project members:', error);
      }
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
