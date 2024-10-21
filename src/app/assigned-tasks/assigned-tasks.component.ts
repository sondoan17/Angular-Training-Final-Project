import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

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
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    SidebarComponent
  ],
  templateUrl: './assigned-tasks.component.html',
  styleUrls: ['./assigned-tasks.component.css']
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
      }
    });
  }

  organizeTasksByProject(tasks: any[]) {
    this.tasksByProject = tasks.reduce((acc, task) => {
      if (!acc[task.projectId]) {
        acc[task.projectId] = {
          projectName: task.projectName,
          tasks: []
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
    this.projectService.updateTaskStatus(projectId, taskId, newStatus).subscribe({
      next: (updatedTask) => {
        // Cập nhật task trong tasksByProject
        const task = this.tasksByProject[projectId].tasks.find(t => t._id === taskId);
        if (task) {
          task.status = newStatus;
        }
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        // Có thể thêm thông báo lỗi cho người dùng ở đây
      }
    });
  }
}
