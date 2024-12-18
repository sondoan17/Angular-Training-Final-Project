import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Angular-Training-Final-Project';
  isSidebarOpen = false;
  showNavAndSidebar = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url === '/login' || event.url === '/register') {
        this.authService.logout();
      }
      this.updateNavAndSidebarVisibility(event.urlAfterRedirects);
    });
  }

  updateNavAndSidebarVisibility(url: string) {
    const excludedPaths = ['/home', '/login', '/register', '/forgot-password', '/reset-password'];
    this.showNavAndSidebar = !excludedPaths.some(path => url.startsWith(path));
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
