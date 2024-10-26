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
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

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
    MatNativeDateModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div
      class="edit-task-dialog bg-white p-6 rounded-lg shadow-md max-w-2xl w-full"
    >
      <h1
        mat-dialog-title
        class="text-2xl font-semibold text-indigo-700 mb-6 text-center"
      >
        Create New Task
      </h1>
      <div mat-dialog-content class="space-y-4">
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Title</mat-label>
          <input
            matInput
            [(ngModel)]="task.title"
            placeholder="Enter task title"
            required
          />
          <mat-icon matSuffix>title</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            [(ngModel)]="task.description"
            rows="3"
            placeholder="Enter task description"
          ></textarea>
          <mat-icon matSuffix>description</mat-icon>
        </mat-form-field>

        <div class="flex space-x-4">
          <mat-form-field appearance="fill" class="w-1/2">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="task.type">
              <mat-option value="task">Task</mat-option>
              <mat-option value="bug">Bug</mat-option>
            </mat-select>
            <mat-icon matSuffix>category</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="fill" class="w-1/2">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="task.status">
              <mat-option value="Not Started">Not Started</mat-option>
              <mat-option value="In Progress">In Progress</mat-option>
              <mat-option value="Stuck">Stuck</mat-option>
              <mat-option value="Done">Done</mat-option>
            </mat-select>
            <mat-icon matSuffix>flag</mat-icon>
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Priority</mat-label>
          <mat-select [(ngModel)]="task.priority">
            <mat-option value="none">None</mat-option>
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
            <mat-option value="critical">Critical</mat-option>
          </mat-select>
          <mat-icon matSuffix>priority_high</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Timeline</mat-label>
          <mat-date-range-input [rangePicker]="picker">
            <input
              matStartDate
              placeholder="Start date"
              [(ngModel)]="task.timeline.start"
            />
            <input
              matEndDate
              placeholder="End date"
              [(ngModel)]="task.timeline.end"
            />
          </mat-date-range-input>
          <mat-datepicker-toggle
            matSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-date-range-picker #picker></mat-date-range-picker>
        </mat-form-field>

        <div class="flex items-center mb-4">
          <mat-checkbox
            [(ngModel)]="assignToMe"
            (change)="onAssignToMeChange()"
            color="primary"
          >
            Assign to me
          </mat-checkbox>
        </div>

        <mat-form-field appearance="fill" class="w-full" *ngIf="!assignToMe">
          <mat-label>Assigned Members</mat-label>
          <mat-select multiple [(ngModel)]="task.assignedTo">
            <mat-option
              *ngFor="let member of data.members"
              [value]="member._id"
            >
              {{ member.username }}
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>group</mat-icon>
        </mat-form-field>
      </div>

      <div mat-dialog-actions class="flex justify-end space-x-3 mt-6">
        <button
          mat-stroked-button
          color="warn"
          (click)="onCancel()"
          class="px-4 py-2"
        >
          <mat-icon>cancel</mat-icon> Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!task.title"
          (click)="onSave()"
          class="px-4 py-2"
        >
          <mat-icon>save</mat-icon> Save
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      ::ng-deep .mat-form-field-appearance-fill .mat-form-field-flex {
        background-color: #f0f4ff;
        border-radius: 8px;
        padding: 0.75em 0.75em 0 0.75em;
      }

      ::ng-deep
        .mat-form-field-appearance-fill
        .mat-form-field-underline::before {
        background-color: #3f51b5;
      }

      ::ng-deep
        .mat-form-field-appearance-fill.mat-focused
        .mat-form-field-label {
        color: #3f51b5;
      }

      ::ng-deep
        .mat-form-field-appearance-fill.mat-focused
        .mat-form-field-flex {
        background-color: #e8eeff;
      }

      ::ng-deep .mat-select-value-text {
        color: #3f51b5;
      }

      ::ng-deep .mat-select-arrow {
        color: #3f51b5;
      }

      ::ng-deep .mat-option {
        color: #3f51b5;
      }

      ::ng-deep .mat-option:hover:not(.mat-option-disabled) {
        background: #e8eeff;
      }

      ::ng-deep
        .mat-option.mat-selected:not(.mat-option-multiple):not(
          .mat-option-disabled
        ) {
        background: #3f51b5;
        color: white;
      }

      ::ng-deep .mat-calendar-body-selected {
        background-color: #3f51b5;
      }

      button.mat-raised-button.mat-primary {
        background-color: #3f51b5;
        color: white;
      }

      button.mat-stroked-button.mat-warn {
        color: #f44336;
        border-color: #f44336;
      }

      ::ng-deep .mat-checkbox-checked.mat-primary .mat-checkbox-background {
        background-color: #3f51b5;
      }
    `,
  ],
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
      end: null,
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
    this.dialogRef.close(this.task);
  }
}
