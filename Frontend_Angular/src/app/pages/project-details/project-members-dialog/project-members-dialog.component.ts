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
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatListModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    MatIconModule
  ],
  templateUrl: './project-members-dialog.component.html',
  styleUrls: ['./project-members-dialog.component.css']
})
export class ProjectMembersDialogComponent {
  newMemberUsername: string = '';

  constructor(
    public dialogRef: MatDialogRef<ProjectMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      members: any[], 
      creatorId: string,
      currentUserId: string
    }
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
    if (this.isCurrentUserCreator() && !this.isCreator(member)) {
      this.dialogRef.close({ action: 'remove', memberId: member._id });
    }
  }

  isCreator(member: any): boolean {
    return member._id === this.data.creatorId;
  }

  isCurrentUserCreator(): boolean {
    return this.data.currentUserId === this.data.creatorId;
  }

  canRemoveMember(member: any): boolean {
    return this.isCurrentUserCreator() && !this.isCreator(member);
  }
}
