import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectService } from '../../../services/project.service';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';


export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
    MatButtonModule,
    MatIconModule
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.css']
})
export class EditTaskDialogComponent implements OnInit {
  projectMembers: any[] = [];
  dateError: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private projectService: ProjectService,
    private dateAdapter: DateAdapter<any>
  ) {
    this.dateAdapter.setLocale('en-GB'); // Set locale to use DD/MM/YYYY format
  }

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

  validateDates(): boolean {
    if (!this.data.timeline.start || !this.data.timeline.end) {
      this.dateError = 'Both start and end dates are required';
      return false;
    }

    const startDate = new Date(this.data.timeline.start);
    const endDate = new Date(this.data.timeline.end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      this.dateError = 'Invalid date format';
      return false;
    }

    if (endDate < startDate) {
      this.dateError = 'End date cannot be before start date';
      return false;
    }

    

    this.dateError = '';
    return true;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.validateDates()) {
      this.dialogRef.close(this.data);
    }
  }
}
