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
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
  ],
  template: `
    <div class="edit-project-dialog w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
      <h1 mat-dialog-title class="dialog-title text-2xl md:text-3xl font-semibold mb-6 text-indigo-700 text-center">Edit Project</h1>
      <div mat-dialog-content class="dialog-content space-y-5">
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Project Name</mat-label>
          <input matInput [(ngModel)]="editedProject.name" required placeholder="Enter project name">
          <mat-icon matSuffix>edit</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Project Description</mat-label>
          <textarea matInput [(ngModel)]="editedProject.description" rows="4" placeholder="Enter project description"></textarea>
          <mat-icon matSuffix>description</mat-icon>
        </mat-form-field>
      </div>
      <div mat-dialog-actions class="dialog-actions flex justify-end items-center space-x-2 mt-6">
        <button mat-stroked-button color="warn" (click)="onCancel()" class="action-button">
          <mat-icon class="text-sm">cancel</mat-icon>
          <span class="ml-1">Cancel</span>
        </button>
        <button mat-raised-button color="primary" (click)="onSave()" class="action-button">
          <mat-icon class="text-sm">save</mat-icon>
          <span class="ml-1">Save</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-form-field-appearance-fill .mat-form-field-flex {
      background-color: #f0f4ff;
      border-radius: 0.5rem;
      padding: 0.75em 0.75em 0 0.75em;
    }

    ::ng-deep .mat-form-field-appearance-fill .mat-form-field-underline::before {
      background-color: #3f51b5;
    }

    ::ng-deep .mat-form-field-appearance-fill.mat-focused .mat-form-field-label {
      color: #3f51b5;
    }

    ::ng-deep .mat-form-field-appearance-fill.mat-focused .mat-form-field-flex {
      background-color: #e8eeff;
    }

    .action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    button.mat-raised-button.mat-primary {
      background-color: #3f51b5;
      color: white;
    }

    button.mat-stroked-button.mat-warn {
      color: #f44336;
      border-color: #f44336;
    }
  `]
})
export class EditProjectDialogComponent {
  editedProject: { name: string; description: string };

  constructor(
    public dialogRef: MatDialogRef<EditProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string; description: string }
  ) {
    this.editedProject = { ...data };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.editedProject);
  }
}
