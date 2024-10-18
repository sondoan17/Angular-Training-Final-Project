import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-project-members-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatListModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Project Members</h2>
    <mat-dialog-content>
      <mat-list>
        <mat-list-item *ngFor="let member of data.members">
          {{ member.username }}
          <button mat-icon-button color="warn" (click)="onRemoveMember(member)" *ngIf="member._id !== data.creatorId">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-list-item>
      </mat-list>
      <mat-form-field>
        <mat-label>New Member Username</mat-label>
        <input matInput [(ngModel)]="newMemberUsername">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onClose()">Close</button>
      <button mat-raised-button color="primary" (click)="onAddMember()">Add Member</button>
    </mat-dialog-actions>
  `,
})
export class ProjectMembersDialogComponent {
  newMemberUsername: string = '';

  constructor(
    public dialogRef: MatDialogRef<ProjectMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { members: any[], projectId: string, creatorId: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onAddMember(): void {
    if (this.newMemberUsername) {
      this.dialogRef.close({ action: 'add', username: this.newMemberUsername });
    }
  }

  onRemoveMember(member: any): void {
    this.dialogRef.close({ action: 'remove', memberId: member._id });
  }
}