import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-create-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Create New Task</h2>
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Title</mat-label>
        <input matInput [(ngModel)]="task.title" required />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Description</mat-label>
        <textarea matInput [(ngModel)]="task.description" rows="3"></textarea>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Type</mat-label>
        <mat-select [(ngModel)]="task.type">
          <mat-option value="task">Task</mat-option>
          <mat-option value="bug">Bug</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="task.status">
          <mat-option value="Not Started">Not Started</mat-option>
          <mat-option value="In Progress">In Progress</mat-option>
          <mat-option value="Stuck">Stuck</mat-option>
          <mat-option value="Done">Done</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Priority</mat-label>
        <mat-select [(ngModel)]="task.priority">
          <mat-option value="none">None</mat-option>
          <mat-option value="low">Low</mat-option>
          <mat-option value="medium">Medium</mat-option>
          <mat-option value="high">High</mat-option>
          <mat-option value="critical">Critical</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Enter a date range</mat-label>
        <mat-date-range-input [rangePicker]="picker">
          <input matStartDate placeholder="Start date" [(ngModel)]="task.timeline.start">
          <input matEndDate placeholder="End date" [(ngModel)]="task.timeline.end">
        </mat-date-range-input>
        <mat-hint>MM/DD/YYYY – MM/DD/YYYY</mat-hint>
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-date-range-picker #picker></mat-date-range-picker>
      </mat-form-field>
      <mat-checkbox [(ngModel)]="assignToMe" (change)="onAssignToMeChange()"
        >Assign to me</mat-checkbox
      >

      <mat-form-field *ngIf="!assignToMe">
        <mat-label>Assigned To</mat-label>
        <mat-select [(ngModel)]="task.assignedTo" multiple>
          <mat-option *ngFor="let member of data.members" [value]="member._id">
            {{ member.username }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="!task.title"
      >
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class CreateTaskDialogComponent {
  task: any = {
    title: '',
    description: '',
    type: 'task',
    status: 'Not Started',
    priority: 'none',
    timeline: {
      start: null,
      end: null
    },
    assignedTo: [],
  };
  assignToMe: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { members: any[] },
    private authService: AuthService
  ) {}

  onAssignToMeChange(): void {
    if (this.assignToMe) {
      this.task.assignedTo = [this.authService.getCurrentUserId()];
    } else {
      this.task.assignedTo = [];
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.assignToMe) {
      this.task.assign;
    }
    this.dialogRef.close(this.task);
  }
}
