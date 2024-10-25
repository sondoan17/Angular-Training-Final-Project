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
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Project Members</h2>
      <div class="max-h-60 overflow-y-auto mb-4">
        <ul class="divide-y divide-gray-200">
          <li *ngFor="let member of data.members" class="py-3 flex items-center justify-between">
            <div class="flex items-center">
              <img class="h-10 w-10 rounded-full bg-gray-300" src="https://ui-avatars.com/api/?name={{member.username}}&background=random" alt="{{member.username}}">
              <span class="ml-3 font-medium text-gray-900">{{ member.username }}</span>
            </div>
            <button 
              *ngIf="member._id !== data.creatorId"
              mat-icon-button 
              color="warn" 
              (click)="onRemoveMember(member)"
              class="text-red-500 hover:text-red-700"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </li>
        </ul>
      </div>
      <mat-form-field appearance="outline" class="w-full mb-4 custom-form-field">
        <mat-label>New Member Username</mat-label>
        <input matInput [(ngModel)]="newMemberUsername" placeholder="Enter username">
      </mat-form-field>
      <div class="flex justify-end space-x-2">
        <button mat-button (click)="onClose()" class="text-gray-600 hover:bg-gray-100">
          Close
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onAddMember()"
          [disabled]="!newMemberUsername"
          class="bg-blue-500 text-white hover:bg-blue-600"
        >
          Add Member
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 400px;
    }
    .mat-mdc-form-field {
      width: 100%;
    }
    ::ng-deep .custom-form-field .mdc-notched-outline__leading,
    ::ng-deep .custom-form-field .mdc-notched-outline__notch,
    ::ng-deep .custom-form-field .mdc-notched-outline__trailing {
      border-color: transparent !important;
    }
    ::ng-deep .custom-form-field .mat-mdc-text-field-wrapper {
      background-color: #f3f4f6;
      border-radius: 0.375rem;
    }
    ::ng-deep .custom-form-field .mat-mdc-form-field-flex {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
  `]
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
