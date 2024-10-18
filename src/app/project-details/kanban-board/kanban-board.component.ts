import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

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
    <div class="kanban-board">
      <div class="kanban-column" *ngFor="let column of columns" 
           cdkDropList
           [cdkDropListData]="column.tasks"
           (cdkDropListDropped)="drop($event)"
           [id]="column.id"
           [cdkDropListConnectedTo]="getConnectedList()">
        <h3>{{ column.title }}</h3>
        <mat-card *ngFor="let task of column.tasks" 
                  cdkDrag 
                  (click)="onTaskClick(task)">
          <mat-card-title>{{ task.title }}</mat-card-title>
          <mat-card-content>
            <p>{{ task.description }}</p>
            <p>Priority: {{ task.priority }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
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
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .cdk-drag-placeholder {
      opacity: 0;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  @Input() tasks: Task[] = [];
  @Input() projectId!: string;
  @Output() taskMoved = new EventEmitter<{ task: Task, newStatus: string }>();

  columns: Column[] = [
    { id: 'not-started', title: 'Not Started', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'stuck', title: 'Stuck', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.distributeTasksToColumns();
  }

  distributeTasksToColumns() {
    this.columns.forEach(column => column.tasks = []);
    this.tasks.forEach(task => {
      const column = this.columns.find(col => col.title.toLowerCase() === task.status.toLowerCase());
      if (column) {
        column.tasks.push(task);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const task = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromColumnId(event.container.id);
      this.taskMoved.emit({ task, newStatus });
    }
  }

  getStatusFromColumnId(columnId: string): string {
    const column = this.columns.find(col => col.id === columnId);
    return column ? column.title : '';
  }

  onTaskClick(task: Task) {
    this.router.navigate(['/projects', this.projectId, 'tasks', task._id]);
  }

  getConnectedList(): string[] {
    return this.columns.map(column => column.id);
  }
}
