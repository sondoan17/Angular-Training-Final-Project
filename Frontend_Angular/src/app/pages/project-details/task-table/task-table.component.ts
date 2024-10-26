import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.css']
})
export class TaskTableComponent {
  @Input() tasks: any[] = [];
  @Input() projectId: string = '';
  @Output() taskMoved = new EventEmitter<any>();

  displayedColumns: string[] = ['title', 'status', 'priority', 'assignedTo', 'actions'];
  statuses = ['Not Started', 'In Progress', 'Stuck', 'Done'];

  moveTask(task: any, newStatus: string) {
    this.taskMoved.emit({ task, newStatus });
  }

  getAssignedUsernames(task: any): string {
    if (task.assignedTo && Array.isArray(task.assignedTo)) {
      return task.assignedTo.map((user: any) => user.username).join(', ');
    }
    return '';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Not Started': return 'bg-gray-200 text-gray-800';
      case 'In Progress': return 'bg-blue-200 text-blue-800';
      case 'Stuck': return 'bg-red-200 text-red-800';
      case 'Done': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  }
}
