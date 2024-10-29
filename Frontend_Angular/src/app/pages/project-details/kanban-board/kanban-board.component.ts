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
import { ProjectService } from '../../../services/project.service';

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
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
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
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusFromColumnId(event.container.id);
      
      if (task.status !== newStatus) {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        
        this.taskMoved.emit({ task, newStatus });
      }
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
}