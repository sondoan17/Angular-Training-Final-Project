import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, MatSidenavModule],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {
  task: any;
  assignedUsernames: string[] = [];
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
          this.updateAssignedUsernames();
        },
        error: (error) => console.error('Error fetching task details:', error)
      });
    }
  }

  updateAssignedUsernames() {
    if (this.task.assignedTo && Array.isArray(this.task.assignedTo)) {
      const userObservables: Observable<string>[] = this.task.assignedTo.map((assignee: any) => 
        this.getUsernameObservable(assignee)
      );

      forkJoin(userObservables).subscribe({
        next: (usernames) => {
          this.assignedUsernames = usernames.filter(username => username !== null);
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
          this.assignedUsernames = this.task.assignedTo.map((assignee: any) => this.getAssigneeName(assignee));
        }
      });
    } else if (this.task.assignedTo) {
      this.getUsernameObservable(this.task.assignedTo).subscribe({
        next: (username) => {
          this.assignedUsernames = username ? [username] : ['Unknown'];
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
          this.assignedUsernames = [this.getAssigneeName(this.task.assignedTo)];
        }
      });
    } else {
      this.assignedUsernames = ['Unassigned'];
    }
  }

  private getUsernameObservable(assignee: any): Observable<string | null> {
    if (typeof assignee === 'string') {
      return this.userService.getUserById(assignee).pipe(
        map(user => user.username),
        catchError(error => {
          console.error('Error fetching user:', error);
          return of(`Unknown (ID: ${assignee})`);
        })
      );
    } else if (assignee && typeof assignee === 'object' && assignee.username) {
      return of(assignee.username);
    } else {
      return of(null);
    }
  }

  private getAssigneeName(assignee: any): string {
    if (typeof assignee === 'string') {
      return `Unknown (ID: ${assignee})`;
    } else if (assignee && typeof assignee === 'object' && assignee.username) {
      return assignee.username;
    } else {
      return 'Unknown';
    }
  }
}
