import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-project-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Edit Project</h2>
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Project Name</mat-label>
        <input matInput [(ngModel)]="data.name" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Project Description</mat-label>
        <textarea matInput [(ngModel)]="data.description" rows="4"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()">Save Changes</button>
    </mat-dialog-actions>
  `,
})
export class EditProjectDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string; description: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data);
  }
}

