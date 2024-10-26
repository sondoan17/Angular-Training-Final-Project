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

interface TasksByProject {
  [projectId: string]: {
    projectName: string;
    tasks: any[];
  };
}

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
  ],
  templateUrl: './assigned-tasks.component.html',
  styleUrls: ['./assigned-tasks.component.css'],
})
export class AssignedTasksComponent implements OnInit {
  tasksByProject: TasksByProject = {};
  statuses = ['Not Started', 'In Progress', 'Stuck', 'Done'];

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.loadAssignedTasks();
  }

  loadAssignedTasks() {
    this.projectService.getAssignedTasks().subscribe({
      next: (tasks) => {
        this.organizeTasksByProject(tasks);
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
}
