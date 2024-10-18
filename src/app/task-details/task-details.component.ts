import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { UserService } from '../services/user.service'; // You might need to create this service
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="task">
      <h2>{{ task.title }}</h2>
      <p>Description: {{ task.description }}</p>
      <p>Status: {{ task.status }}</p>
      <p>Type: {{ task.type }}</p>
      <p>Priority: {{ task.priority }}</p>
      <p>Timeline: {{ task.timeline.days }} days, {{ task.timeline.months }} months</p>
      <p>Assigned to: {{ assignedUsername }}</p>
    </div>
  `
})
export class TaskDetailsComponent implements OnInit {
  task: any;
  assignedUsername: string = 'Unassigned';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    const taskId = this.route.snapshot.paramMap.get('taskId');
    if (projectId && taskId) {
      this.projectService.getTaskDetails(projectId, taskId).subscribe({
        next: (task) => {
          
          this.task = task;
          this.updateAssignedUsername();
        },
        error: (error) => console.error('Error fetching task details:', error)
      });
    }
  }

  updateAssignedUsername() {
    if (this.task.assignedTo) {
      if (typeof this.task.assignedTo === 'string') {
        this.userService.getUserById(this.task.assignedTo).subscribe({
          next: (user) => {
            this.assignedUsername = user.username;
          },
          error: (error) => {
            console.error('Error fetching user details:', error);
            this.assignedUsername = 'Unknown (ID: ' + this.task.assignedTo + ')';
          }
        });
      } else if (this.task.assignedTo.username) {
        this.assignedUsername = this.task.assignedTo.username;
      } else {
        this.assignedUsername = 'Unknown';
      }
    } else {
      this.assignedUsername = 'Unassigned';
    }
  }
}
