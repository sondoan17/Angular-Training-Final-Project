import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { NotificationMenuComponent } from '../../components/notification-menu/notification-menu.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

interface SearchResult {
  type: 'project' | 'task';
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  projectId?: string;
  projectName?: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    FormsModule,
    NotificationMenuComponent,
  ],
})
export class NavbarComponent implements OnInit {
  username: string | null = null;
  searchTerm: string = '';
  searchResults: SearchResult[] = [];
  showDropdown = false;
  private searchSubject = new Subject<string>();

  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private searchService: SearchService
  ) {
    this.setupSearch();
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      if (term.trim().length >= 2) {
        this.searchService.searchProjectsAndTasks(term).subscribe({
          next: (results) => {
            this.searchResults = results.slice(0, 5); // Limit to 5 results
            this.showDropdown = true;
          },
          error: (error) => console.error('Search error:', error)
        });
      } else {
        this.searchResults = [];
        this.showDropdown = false;
      }
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.searchTerm);
  }

  navigateToResult(result: SearchResult) {
    if (result.type === 'project') {
      this.router.navigate(['/projects', result._id]);
    } else {
      this.router.navigate(['/projects', result.projectId], {
        queryParams: { taskId: result._id }
      });
    }
    this.closeDropdown();
  }

  closeDropdown() {
    this.showDropdown = false;
    this.searchResults = [];
    this.searchTerm = '';
  }

  ngOnInit() {
    this.updateUsername();
  }

  updateUsername() {
    this.username = localStorage.getItem('username');
  }

  get userInitial(): string {
    return this.username ? this.username[0].toUpperCase() : '?';
  }

  logout() {
    this.authService.logout();
    this.username = null;
    this.router.navigate(['/login']);
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  performSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { term: this.searchTerm }
      });
    }
  }

  handleBlur() {
    setTimeout(() => {
      this.closeDropdown();
    }, 200);
  }
}
