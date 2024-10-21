import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, MatSidenavModule],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {
  task: any;
  assignedUsername: string = 'Unassigned';
  creatorUsername: string = 'Unknown';

  @ViewChild('sidenav') sidenav!: MatSidenav;

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
          this.updateCreatorUsername();
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

  updateCreatorUsername() {
    if (this.task.createdBy) {
      if (typeof this.task.createdBy === 'string') {
        this.userService.getUserById(this.task.createdBy).subscribe({
          next: (user) => {
            this.creatorUsername = user.username;
          },
          error: (error) => {
            console.error('Error fetching creator details:', error);
            this.creatorUsername = 'Unknown (ID: ' + this.task.createdBy + ')';
          }
        });
      } else if (this.task.createdBy.username) {
        this.creatorUsername = this.task.createdBy.username;
      } else {
        this.creatorUsername = 'Unknown';
      }
    }
  }

  getCreatorUsername(): string {
    return this.creatorUsername;
  }
}
