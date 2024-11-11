import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-task-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-details-dialog.component.html',
  styleUrls: ['./task-details-dialog.component.css'],
})
export class TaskDetailsDialogComponent implements OnInit {
  isLoading = true;
  taskDetails: any;

  constructor(
    public dialogRef: MatDialogRef<TaskDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadTaskDetails();
  }

  loadTaskDetails() {
    this.isLoading = true;
    this.projectService
      .getTaskDetails(this.data.projectId, this.data.task._id)
      .subscribe({
        next: (details) => {
          this.taskDetails = details;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading task details:', error);
          this.isLoading = false;
        },
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  viewFullDetails(): void {
    this.dialogRef.close();
    this.router.navigate([
      '/projects',
      this.data.projectId,
      'tasks',
      this.data.task._id,
    ]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-500 text-white';
      case 'In Progress':
        return 'bg-blue-500 text-white';
      case 'Stuck':
        return 'bg-red-500 text-white';
      case 'Done':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low':
        return 'bg-green-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'critical':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  getAssignedMembers(): any[] {
    const task = this.taskDetails || this.data.task;
    if (!task || !task.assignedTo) return [];

    return task.assignedTo.map((member: any) => {
      if (typeof member === 'object' && member !== null) {
        return member;
      }
      const projectMember = this.data.projectMembers.find(
        (m: any) => m._id === member
      );
      return projectMember || { _id: member, username: 'Unknown User' };
    });
  }
}
