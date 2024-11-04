import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, Subscription, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('200ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, height: 0 }))
      ])
    ])
  ]
})
export class SearchComponent implements OnInit, OnDestroy {
  searchForm = new FormGroup({
    searchTerm: new FormControl(''),
    status: new FormControl(''),
    priority: new FormControl(''),
    type: new FormControl(''),
  });

  searchResults: any[] = [];
  private searchSubscription: Subscription | null = null;
  private unsubscribe$ = new Subject<void>();

  statusOptions = ['Not Started', 'In Progress', 'Stuck', 'Done'];
  priorityOptions = ['none', 'low', 'medium', 'high', 'critical'];
  typeOptions = ['task', 'bug'];

  isFiltersVisible = false;

  constructor(private searchService: SearchService, private router: Router) {}

  ngOnInit() {
    this.searchSubscription = this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((formValue) => {
          if (formValue.searchTerm && formValue.searchTerm.trim() !== '') {
            return this.searchService.searchProjectsAndTasks(
              formValue.searchTerm,
              formValue.status || undefined,
              formValue.priority || undefined,
              formValue.type || undefined
            );
          } else {
            return of([]);
          }
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results;
        },
        error: (error) => {
          console.error('Error searching:', error);
        },
      });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  navigateToProject(projectId: string) {
    this.router.navigate(['/projects', projectId]);
  }

  navigateToTask(projectId: string, taskId: string) {
    this.router.navigate(['/projects', projectId, 'tasks', taskId]);
  }

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }
}
