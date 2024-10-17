import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
  ],
})
export class NavbarComponent implements OnInit {
  username: string | null = null;

  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

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
}
