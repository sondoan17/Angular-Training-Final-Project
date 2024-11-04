import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

interface TasksByProject {
  [projectId: string]: {
    projectName: string;
    tasks: any[];
  };
}

type SortOption = 'status' | 'priority' | 'title';
type SortDirection = 'asc' | 'desc';
type TaskStatus = 'Not Started' | 'In Progress' | 'Stuck' | 'Done';
type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

@Component({
  selector: 'app-assigned-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    RouterModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './assigned-tasks.component.html',
  styleUrls: ['./assigned-tasks.component.css'],
})
export class AssignedTasksComponent implements OnInit {
  tasksByProject: TasksByProject = {};
  statuses = ['Not Started', 'In Progress', 'Stuck', 'Done'];
  priorities = ['Critical', 'High', 'Medium', 'Low'];

  sortBy: SortOption = 'status';
  sortDirection: SortDirection = 'asc';

  sortOptions = [
    { value: 'status', label: 'Status', icon: 'list_alt' },
    { value: 'priority', label: 'Priority', icon: 'priority_high' },
    { value: 'title', label: 'Title', icon: 'sort_by_alpha' }
  ];

  constructor(private projectService: ProjectService) { }

  ngOnInit() {
    this.loadAssignedTasks();
  }

  loadAssignedTasks() {
    this.projectService.getAssignedTasks().subscribe({
      next: (tasks) => {
        this.organizeTasksByProject(tasks);
        this.sortTasks();
      },
      error: (error) => {
        console.error('Error loading assigned tasks:', error);
      },
    });
  }

  organizeTasksByProject(tasks: any[]) {
    this.tasksByProject = tasks.reduce((acc, task) => {
      if (!acc[task.projectId]) {
        acc[task.projectId] = {
          projectName: task.projectName,
          tasks: [],
        };
      }
      acc[task.projectId].tasks.push(task);
      return acc;
    }, {});
  }

  sortTasks() {
    Object.values(this.tasksByProject).forEach(project => {
      project.tasks.sort((a, b) => {
        let comparison = 0;

        switch (this.sortBy) {
          case 'status':
            comparison = this.compareStatus(a.status, b.status);
            break;
          case 'priority':
            comparison = this.comparePriority(a.priority, b.priority);
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    });
  }

  private compareStatus(a: string, b: string): number {
    const statusOrder: Record<TaskStatus, number> = {
      'Not Started': 0,
      'In Progress': 1,
      'Stuck': 2,
      'Done': 3
    };

    return (statusOrder[a as TaskStatus] ?? 0) - (statusOrder[b as TaskStatus] ?? 0);
  }

  private comparePriority(a: string, b: string): number {
    const priorityOrder: Record<string, number> = {
      'critical': 0,
      'high': 1,
      'medium': 2,
      'low': 3
    };

    const priorityA = a.toLowerCase();
    const priorityB = b.toLowerCase();

    return (priorityOrder[priorityA] ?? 999) - (priorityOrder[priorityB] ?? 999);
  }

  onSortChange(event: MatSelectChange) {
    this.sortBy = event.value;
    this.sortTasks();
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortTasks();
  }

  get objectKeys() {
    return Object.keys;
  }

  updateTaskStatus(projectId: string, taskId: string, newStatus: string) {
    this.projectService
      .updateTaskStatus(projectId, taskId, newStatus)
      .subscribe({
        next: (updatedTask) => {
          const task = this.tasksByProject[projectId].tasks.find(
            (t) => t._id === taskId
          );
          if (task) {
            task.status = newStatus;
          }
        },
        error: (error) => {
          console.error('Error updating task status:', error);
        },
      });
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
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-green-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'critical':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  getSortIcon(sortValue: string): string {
    const iconMap: Record<string, string> = {
      'status': 'list_alt',
      'priority': 'priority_high',
      'title': 'sort_by_alpha'
    };
    return iconMap[sortValue] || 'sort';
  }

  getTotalTasks(): number {
    return Object.values(this.tasksByProject).reduce(
      (total, project) => total + project.tasks.length, 
      0
    );
  }

  getCompletedTasks(): number {
    return Object.values(this.tasksByProject).reduce(
      (total, project) => total + project.tasks.filter(
        task => task.status === 'Done'
      ).length, 
      0
    );
  }

  getStuckTasks(): number {
    return Object.values(this.tasksByProject).reduce(
      (total, project) => total + project.tasks.filter(
        task => task.status === 'Stuck'
      ).length, 
      0
    );
  }
  getInProgressTasks(): number {
    return Object.values(this.tasksByProject).reduce(
      (total, project) => total + project.tasks.filter(
        task => task.status === 'In Progress'
      ).length, 
      0
    );
  }
  getNotStartedTasks(): number {
    return Object.values(this.tasksByProject).reduce(
      (total, project) => total + project.tasks.filter(
        task => task.status === 'Not Started'
      ).length, 
      0
    );
  }
}
