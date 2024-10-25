import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatCardModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        *ngFor="let column of columns"
        class="p-4 rounded-lg shadow"
        [ngClass]="getColumnClass(column.id)"
        cdkDropList
        [cdkDropListData]="column.tasks"
        (cdkDropListDropped)="drop($event)"
        [id]="column.id"
        [cdkDropListConnectedTo]="getConnectedList()"
      >
        <h3 class="text-lg font-semibold mb-4 text-gray-700">{{ column.title }}</h3>
        <div
          *ngFor="let task of column.tasks"
          cdkDrag
          (click)="onTaskClick(task)"
          class="bg-white p-4 rounded shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4"
          [ngClass]="getTaskBorderClass(task.priority)"
        >
          <h4 class="font-medium mb-2 text-gray-800">{{ task.title }}</h4>
          <p class="text-sm text-gray-600 mb-2 task-description" [title]="task.description">
            {{ task.description }}
          </p>
          <div class="flex justify-end items-center text-xs">
            <span class="px-2 py-1 rounded font-medium" [ngClass]="getTaskPriorityClass(task.priority)">
              {{ task.priority }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .kanban-board {
        display: flex;
        justify-content: space-around;
      }
      .kanban-column {
        width: 200px;
        min-height: 300px;
        border: 1px solid #ccc;
        padding: 10px;
      }
      mat-card {
        margin-bottom: 10px;
        cursor: move;
      }
      .cdk-drag-preview {
        box-sizing: border-box;
        border-radius: 4px;
        box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
          0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
      }
      .cdk-drag-placeholder {
        opacity: 0;
      }
      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .column-drop-zone {
        transition: background-color 0.2s ease;
      }
      .column-drop-zone.cdk-drop-list-dragging {
        background-color: rgba(0, 0, 0, 0.04);
      }
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .task-description {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-wrap: break-word;
        white-space: pre-wrap;
        max-height: 4.5em; /* Approximately 3 lines of text */
      }
    `,
  ],
})
export class KanbanBoardComponent implements OnInit {
  private _tasks: Task[] = [];

  @Input() set tasks(value: Task[]) {
    this._tasks = value;
    this.distributeTasksToColumns();
  }

  get tasks(): Task[] {
    return this._tasks;
  }

  @Input() projectId!: string;
  @Output() taskMoved = new EventEmitter<{ task: Task; newStatus: string }>();

  columns: Column[] = [
    { id: 'not-started', title: 'Not Started', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'stuck', title: 'Stuck', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] },
  ];

  constructor(private router: Router, private projectService: ProjectService) {}

  ngOnInit() {
    this.distributeTasksToColumns();
  }

  public distributeTasksToColumns() {
    this.columns.forEach((column) => (column.tasks = []));
    this.tasks.forEach((task) => {
      const column = this.columns.find(
        (col) => col.title.toLowerCase() === task.status.toLowerCase()
      );
      if (column) {
        column.tasks.push(task);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const task = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromColumnId(event.container.id);
      this.updateTaskStatus(task, newStatus);
    }
  }

  getStatusFromColumnId(columnId: string): string {
    const column = this.columns.find((col) => col.id === columnId);
    return column ? column.title : '';
  }

  onTaskClick(task: Task) {
    this.router.navigate(['/projects', this.projectId, 'tasks', task._id]);
  }

  getConnectedList(): string[] {
    return this.columns.map((column) => column.id);
  }

  getColumnClass(columnId: string): string {
    switch (columnId) {
      case 'not-started':
        return 'bg-gray-50 border-t-4 border-gray-300';
      case 'in-progress':
        return 'bg-blue-50 border-t-4 border-blue-400';
      case 'stuck':
        return 'bg-red-50 border-t-4 border-red-400';
      case 'done':
        return 'bg-green-50 border-t-4 border-green-400';
      default:
        return 'bg-gray-50';
    }
  }

  getTaskBorderClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'border-purple-500';
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  }

  getTaskPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-purple-600 text-white';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  updateTaskStatus(task: Task, newStatus: string) {
    this.projectService.updateTaskStatus(this.projectId, task._id, newStatus).subscribe(
      (updatedTask) => {
        console.log('Task status updated:', updatedTask);
        if (updatedTask && updatedTask._id) {
          // Update the local task object
          Object.assign(task, updatedTask);
          this.taskMoved.emit({ task: updatedTask, newStatus });
        } else {
          console.error('Invalid task data returned from server:', updatedTask);
          // Optionally, revert the UI change or show an error message
        }
      },
      (error) => {
        console.error('Error updating task status:', error);
        // Revert the UI change
        this.distributeTasksToColumns();
        // Optionally, show an error message to the user
      }
    );
  }
}
